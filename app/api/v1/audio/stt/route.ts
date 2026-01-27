import { Buffer } from 'node:buffer'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { transcribeAudio } from '@/lib/audio/client'
import { requireAuth } from '@/lib/auth/guards'
import { env } from '@/lib/env'
import { enforceBodySizeLimit } from '@/lib/http/bodyLimit'

const sttSchema = z.object({
  base64_audio: z.string().min(1),
  mime_type: z.string().optional(),
})

const DATA_URL_REGEX = /^data:([\w/+.-]+);base64,(.*)$/i

function decodeBase64(base64: string) {
  const match = DATA_URL_REGEX.exec(base64.trim())
  if (match) {
    return { buffer: Buffer.from(match[2], 'base64'), mime: match[1] }
  }
  return { buffer: Buffer.from(base64, 'base64'), mime: undefined }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    enforceBodySizeLimit(req, env.MAX_UPLOAD_BYTES * 2)
    if (env.AUDIO_STUB_MODE) {
      return NextResponse.json({ text: 'متن نمونه (حالت شبیه‌ساز).' })
    }
    const body = sttSchema.parse(await req.json())
    const decoded = decodeBase64(body.base64_audio)
    const mime = (body.mime_type || decoded.mime || 'audio/mpeg').toLowerCase()

    if (decoded.buffer.byteLength > env.MAX_UPLOAD_BYTES) {
      return NextResponse.json({ detail: 'Audio too large.' }, { status: 400 })
    }

    const text = await transcribeAudio({ buffer: decoded.buffer, mimeType: mime })
    return NextResponse.json({ text })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const status = (error as { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
