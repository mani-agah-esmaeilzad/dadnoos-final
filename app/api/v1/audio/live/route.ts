import { Buffer } from 'node:buffer'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth/guards'
import { enforceBodySizeLimit } from '@/lib/http/bodyLimit'
import { env } from '@/lib/env'
import {
  createLiveSession,
  getLiveSession,
  incrementChunks,
  endLiveSession,
  pruneInactiveSessions,
  appendUserMessage,
  appendAssistantMessage,
} from '@/lib/audio/liveSessionStore'
import { liveChatCompletion, synthesizeSpeech, transcribeAudio } from '@/lib/audio/client'
import { HttpError } from '@/lib/http/errors'

const liveSchema = z.object({
  action: z.enum(['start', 'chunk', 'stop']),
  session_id: z.string().optional(),
  base64_audio: z.string().optional(),
  mime_type: z.string().optional(),
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    enforceBodySizeLimit(req, env.MAX_UPLOAD_BYTES * 2)
    pruneInactiveSessions()
    const body = liveSchema.parse(await req.json())

    if (body.action === 'start') {
      const session = createLiveSession()
      return NextResponse.json({
        session_id: session.id,
        expires_in: 60,
      })
    }

    if (!body.session_id) {
      return NextResponse.json({ detail: 'session_id الزامی است.' }, { status: 400 })
    }

    const session = getLiveSession(body.session_id)
    if (!session) {
      return NextResponse.json({ detail: 'جلسه معتبر نیست یا منقضی شده.' }, { status: 410 })
    }

    if (body.action === 'chunk') {
      if (!body.base64_audio) {
        return NextResponse.json({ detail: 'داده صوتی ارسال نشده است.' }, { status: 400 })
      }
      const buffer = Buffer.from(body.base64_audio, 'base64')
      if (buffer.byteLength === 0) {
        return NextResponse.json({ detail: 'داده صوتی خالی است.' }, { status: 400 })
      }
      incrementChunks(session.id)
      try {
        const safeMime = (body.mime_type || 'audio/webm').split(';')[0]?.toLowerCase() || 'audio/webm'
        const transcript = await transcribeAudio({
          buffer,
          mimeType: safeMime,
        })
        const trimmedTranscript = transcript.trim()
        if (!trimmedTranscript) {
          return NextResponse.json({ detail: 'گفتاری شناسایی نشد.' }, { status: 422 })
        }
        appendUserMessage(session.id, trimmedTranscript)
        const responseText = await liveChatCompletion({ messages: session.messages })
        appendAssistantMessage(session.id, responseText)
        try {
          const audio = await synthesizeSpeech({ input: responseText })
          const audioBase64 = audio.toString('base64')
          return NextResponse.json({
            transcript: trimmedTranscript,
            response: {
              text: responseText,
              audio_base64: audioBase64,
              mime_type: 'audio/mpeg',
            },
          })
        } catch (ttsError) {
          console.error('Live chunk TTS failed:', (ttsError as Error).message)
          return NextResponse.json({
            transcript: trimmedTranscript,
            response: {
              text: responseText,
            },
          })
        }
      } catch (error) {
        const upstreamStatus = (error as { status?: number }).status
        const upstreamDetail =
          (error as { detail?: string }).detail || (error as Error)?.message || 'Unknown audio error'
        console.error('Live chunk processing failed:', upstreamDetail)
        if (upstreamStatus === 400) {
          return NextResponse.json(
            {
              detail: 'فایل صوتی نامعتبر است یا پشتیبانی نمی‌شود. لطفاً دوباره تلاش کنید.',
            },
            { status: 400 }
          )
        }
        if (upstreamStatus === 503) {
          return NextResponse.json(
            {
              detail: 'سرویس مدل یا صوت در دسترس نیست. چند لحظه دیگر تلاش کنید.',
            },
            { status: 503 }
          )
        }
        return NextResponse.json(
          {
            detail: 'سرویس مدل یا صوت در دسترس نیست. چند لحظه دیگر تلاش کنید.',
          },
          { status: 502 }
        )
      }
    }

    if (body.action === 'stop') {
      endLiveSession(session.id)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ detail: 'درخواست نامعتبر.' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    if (error instanceof HttpError) {
      return NextResponse.json({ detail: error.message, issues: error.details }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}
