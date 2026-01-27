import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'

import { env } from '@/lib/env'

const IMAGE_EXTS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

const FILE_EXTS: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
}

const DATA_URL_REGEX = /^data:([\w/+.-]+);base64,(.*)$/i

function ensureUploadsDir() {
  const dir = path.resolve(process.cwd(), env.UPLOADS_DIR)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function decodeBase64(input: string) {
  const trimmed = input.trim()
  const match = DATA_URL_REGEX.exec(trimmed)
  const payload = match ? match[2] : trimmed
  try {
    return {
      mime: match ? match[1] : undefined,
      buffer: Buffer.from(payload, 'base64'),
    }
  } catch (error) {
    throw new Error('Invalid base64 payload')
  }
}

function buildPublicUrl(filename: string) {
  const urlPath = `/uploads/${filename}`
  return `${env.PUBLIC_BASE_URL.replace(/\/$/, '')}${urlPath}`
}

function randomName(ext: string) {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`
}

export interface SavedFile {
  url: string
  relativePath: string
  absolutePath: string
  size: number
  mime: string
  filename: string
}

export function saveBase64Payload({
  base64,
  mimeType,
  allowedExts,
}: {
  base64: string
  mimeType?: string | null
  allowedExts: Record<string, string>
}): SavedFile {
  const { mime: detectedMime, buffer } = decodeBase64(base64)
  const finalMime = (mimeType || detectedMime || '').toLowerCase()
  if (!allowedExts[finalMime]) {
    throw new Error('Unsupported file type')
  }
  if (buffer.byteLength > env.MAX_UPLOAD_BYTES) {
    throw new Error('File too large')
  }

  const uploadsDir = ensureUploadsDir()
  const filename = randomName(allowedExts[finalMime])
  const absolutePath = path.join(uploadsDir, filename)
  fs.writeFileSync(absolutePath, buffer)

  return {
    url: buildPublicUrl(filename),
    relativePath: `/uploads/${filename}`,
    absolutePath,
    size: buffer.byteLength,
    mime: finalMime,
    filename,
  }
}

export function saveImageBase64(base64: string, mimeType?: string | null) {
  return saveBase64Payload({ base64, mimeType, allowedExts: IMAGE_EXTS })
}

export function saveDocumentBase64(base64: string, mimeType?: string | null) {
  return saveBase64Payload({ base64, mimeType, allowedExts: FILE_EXTS })
}
