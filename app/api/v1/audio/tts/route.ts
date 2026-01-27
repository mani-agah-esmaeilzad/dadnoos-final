import { Buffer } from 'node:buffer'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { synthesizeSpeech } from '@/lib/audio/client'
import { requireAuth } from '@/lib/auth/guards'
import { env } from '@/lib/env'
import { enforceBodySizeLimit } from '@/lib/http/bodyLimit'

const ttsSchema = z.object({
  text: z.string().min(1),
  voice: z.string().optional(),
  format: z.enum(['mp3', 'wav', 'opus', 'flac']).optional(),
})

const MIME_MAP: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  opus: 'audio/ogg',
  flac: 'audio/flac',
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    enforceBodySizeLimit(req, 32 * 1024)
    const body = ttsSchema.parse(await req.json())
    const format = body.format || 'mp3'
    if (env.AUDIO_STUB_MODE) {
      const stub = Buffer.from(body.text ?? 'tts stub', 'utf-8')
      return new NextResponse(stub, {
        status: 200,
        headers: {
          'Content-Type': MIME_MAP[format] || 'audio/mpeg',
          'Cache-Control': 'no-store',
        },
      })
    }
    const audio = await synthesizeSpeech({ text: body.text, voice: body.voice, format })
    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': MIME_MAP[format] || 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const status = (error as { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
