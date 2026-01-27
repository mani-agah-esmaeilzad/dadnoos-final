import { env } from '@/lib/env'

export type LlmRole = 'system' | 'user' | 'assistant'

export interface LlmMessage {
  role: LlmRole
  content: string
}

const DEFAULT_TEMPERATURE = 0.3

function buildUrl(path: string) {
  const base = env.LLM_BASE_URL || 'https://api.openai.com/v1'
  return `${base.replace(/\/$/, '')}${path}`
}

async function postJson(path: string, body: unknown, init?: RequestInit) {
  const url = buildUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.LLM_API_KEY}`,
    },
    body: JSON.stringify(body),
    ...init,
  })
  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Upstream error')
    throw new Error(`LLM request failed (${res.status}): ${errorBody}`)
  }
  return res
}

export async function createChatCompletion({
  messages,
  temperature = DEFAULT_TEMPERATURE,
  maxTokens,
  model,
}: {
  messages: LlmMessage[]
  temperature?: number
  maxTokens?: number
  model?: string
}) {
  const res = await postJson('/chat/completions', {
    model: model || env.LLM_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  })
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const text = json.choices?.[0]?.message?.content?.trim()
  if (!text) {
    throw new Error('LLM returned empty response')
  }
  return text
}

export async function createChatCompletionStream({
  messages,
  temperature = DEFAULT_TEMPERATURE,
  maxTokens,
}: {
  messages: LlmMessage[]
  temperature?: number
  maxTokens?: number
}) {
  const res = await postJson(
    '/chat/completions',
    {
      model: env.LLM_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    },
    { next: { revalidate: 0 } }
  )
  return res.body
}
