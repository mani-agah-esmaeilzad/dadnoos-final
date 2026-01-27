import { Buffer } from 'node:buffer'

import { env } from '@/lib/env'

const baseUrl = (env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')

async function authorizedFetch(path: string, init: RequestInit) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.LLM_API_KEY}`,
      ...(init.headers || {}),
    },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => 'Upstream error')
    throw new Error(`Audio request failed (${res.status}): ${detail}`)
  }
  return res
}

export async function transcribeAudio({
  buffer,
  mimeType,
}: {
  buffer: Buffer
  mimeType: string
}) {
  const form = new FormData()
  const model = env.TRANSCRIPTION_MODEL || 'gpt-4o-transcribe'
  form.append('model', model)
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
  form.append('file', new Blob([arrayBuffer], { type: mimeType }), 'audio')
  if (env.TRANSCRIPTION_LANGUAGE) {
    form.append('language', env.TRANSCRIPTION_LANGUAGE)
  }

  const res = await authorizedFetch('/audio/transcriptions', {
    method: 'POST',
    body: form,
  })
  const data = (await res.json()) as { text?: string }
  if (!data.text) {
    throw new Error('Empty transcription result')
  }
  return data.text
}

export async function synthesizeSpeech({
  text,
  voice,
  format = 'mp3',
}: {
  text: string
  voice?: string
  format?: string
}) {
  const model = env.TTS_MODEL || 'gpt-4o-mini-tts'
  const res = await authorizedFetch('/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice: voice || env.TTS_DEFAULT_VOICE || 'alloy',
      input: text,
      format,
    }),
  })
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
