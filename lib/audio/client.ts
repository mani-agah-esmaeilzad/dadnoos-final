import { Buffer } from 'node:buffer'

import { env } from '@/lib/env'

const baseUrl = (env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')

const MIME_EXTENSION_MAP: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/aac': 'aac',
  'audio/flac': 'flac',
  'audio/pcm': 'pcm',
}

function normalizeAudioMime(mimeType?: string) {
  if (!mimeType) return 'audio/webm'
  const lower = mimeType.toLowerCase()
  if (lower.includes('webm')) return 'audio/webm'
  if (lower.includes('ogg')) return 'audio/ogg'
  if (lower.includes('mpeg') || lower.includes('mp3')) return 'audio/mpeg'
  if (lower.includes('wav')) return 'audio/wav'
  if (lower.includes('m4a') || lower.includes('mp4')) return 'audio/mp4'
  if (lower.includes('aac')) return 'audio/aac'
  if (lower.includes('flac')) return 'audio/flac'
  if (lower.includes('pcm')) return 'audio/pcm'
  return lower
}

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
    const error = new Error(`Audio request failed (${res.status}): ${detail}`)
    ;(error as { status?: number }).status = res.status
    ;(error as { detail?: string }).detail = detail
    throw error
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
  const normalizedMime = normalizeAudioMime(mimeType)
  const extension = MIME_EXTENSION_MAP[normalizedMime] || 'bin'
  const uint8Array = Uint8Array.from(buffer)
  const blob = new Blob([uint8Array], { type: normalizedMime })
  form.append('file', blob, `chunk.${extension}`)
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

type VoiceConfig = string | { name: string; languageCode?: string }

export async function synthesizeSpeech({
  input,
  voice,
  responseFormat = 'mp3',
  speed,
  instructions,
}: {
  input: string
  voice?: VoiceConfig
  responseFormat?: string
  speed?: number
  instructions?: string
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
      input,
      response_format: responseFormat,
      ...(speed ? { speed } : {}),
      ...(instructions ? { instructions } : {}),
    }),
  })
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function liveChatCompletion({
  messages,
}: {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
}) {
  const model = env.LLM_MODEL || 'gpt-4o-mini'
  const res = await authorizedFetch('/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
    }),
  })
  const data = (await res.json()) as {
    choices: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Empty completion result')
  }
  return content.trim()
}
