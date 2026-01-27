import fs from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/lib/env'

function detectMime(filePath: string) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.pdf') return 'application/pdf'
  if (ext === '.doc') return 'application/msword'
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  return 'application/octet-stream'
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params
  const uploadsDir = path.resolve(process.cwd(), env.UPLOADS_DIR)
  const requested = segments.join('/')
  const filePath = path.join(uploadsDir, requested)
  if (!filePath.startsWith(uploadsDir)) {
    return NextResponse.json({ detail: 'Not found' }, { status: 404 })
  }

  try {
    const data = await fs.promises.readFile(filePath)
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
    const blob = new Blob([arrayBuffer])
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': detectMime(filePath),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return NextResponse.json({ detail: 'Not found' }, { status: 404 })
  }
}
