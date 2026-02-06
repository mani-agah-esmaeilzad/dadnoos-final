import { Buffer } from 'node:buffer'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { synthesizeSpeech } from '@/lib/audio/client'
import { requireAuth } from '@/lib/auth/guards'
import { env } from '@/lib/env'
import { enforceBodySizeLimit } from '@/lib/http/bodyLimit'

const voiceSchema = z.union([
  z.string().min(1),
  z.object({
    name: z.string().min(1),
    languageCode: z.string().optional(),
  }),
])

const ttsSchema = z.object({
  input: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  voice: voiceSchema.optional(),
  response_format: z.enum(['mp3', 'wav', 'opus', 'flac', 'aac', 'pcm']).optional(),
  speed: z.number().min(0.25).max(4).optional(),
  instructions: z.string().optional(),
})

const MIME_MAP: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  opus: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
  pcm: 'audio/pcm',
}

function createSilentWav(durationMs = 1500, sampleRate = 16000) {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000)
  const bytesPerSample = 2
  const dataSize = numSamples * bytesPerSample
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // PCM chunk size
  buffer.writeUInt16LE(1, 20) // audio format (PCM)
  buffer.writeUInt16LE(1, 22) // channels
  buffer.writeUInt32LE(sampleRate, 24)
  const byteRate = sampleRate * bytesPerSample
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(bytesPerSample, 32)
  buffer.writeUInt16LE(bytesPerSample * 8, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  // data section already zeroed (silence)
  return buffer
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    enforceBodySizeLimit(req, 32 * 1024)
    const body = ttsSchema.parse(await req.json())
    const input = body.input ?? body.text
    if (!input) {
      return NextResponse.json({ detail: 'متن ورودی الزامی است.' }, { status: 400 })
    }
    const requestedFormat = body.response_format || 'mp3'
    const format = env.AUDIO_STUB_MODE ? 'wav' : requestedFormat

    if (env.AUDIO_STUB_MODE) {
      const stub = createSilentWav()
      return new NextResponse(stub, {
        status: 200,
        headers: {
          'Content-Type': MIME_MAP[format] || 'audio/mpeg',
          'Cache-Control': 'no-store',
        },
      })
    }
    const audio = await synthesizeSpeech({
      input,
      voice: body.voice,
      responseFormat: format,
      speed: body.speed,
      instructions: body.instructions,
    })
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
