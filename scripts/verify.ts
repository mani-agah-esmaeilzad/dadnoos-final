import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'

const BASE_URL = process.env.VERIFY_BASE_URL || 'http://localhost:3052'
const PHONE_NUMBER = process.env.VERIFY_PHONE || `09${Math.floor(Math.random() * 9_000_00000 + 10_000_0000)}`
const OTP_OVERRIDE = process.env.VERIFY_OTP_CODE
const SKIP_AUDIO = process.env.VERIFY_SKIP_AUDIO === 'true'

interface RequestOptions extends RequestInit {
  token?: string
}

const SAMPLE_AUDIO_BASE64 =
  'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='

function apiUrl(path: string) {
  return `${BASE_URL}${path}`
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }
  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`${path} failed (${res.status}): ${body}`)
  }
  return res.json() as Promise<T>
}

async function requestBuffer(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }
  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`${path} failed (${res.status}): ${body}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function verifyHealth() {
  const data = await requestJson<{ ok: boolean }>('/api/health', { method: 'GET' })
  assert.equal(data.ok, true, 'health endpoint did not return ok=true')
  console.log('✓ /api/health ok')
}

async function otpFlow() {
  const otpRequest = await requestJson<{ dev_code?: string; _debug_code?: string; request_id: string }>(
    '/api/v1/auth/otp/request',
    {
      method: 'POST',
      body: JSON.stringify({ phone: PHONE_NUMBER }),
    }
  )
  const code = OTP_OVERRIDE || otpRequest.dev_code || otpRequest._debug_code
  if (!code) {
    throw new Error('No OTP code returned. Enable OTP_DEV_MODE or set VERIFY_OTP_CODE.')
  }
  const verify = await requestJson<{ access_token: string; expires_at: string }>(
    '/api/v1/auth/otp/verify',
    {
      method: 'POST',
      body: JSON.stringify({ phone: PHONE_NUMBER, code }),
    }
  )
  console.log('✓ OTP verified')
  return verify.access_token
}

async function ensurePlan(token: string) {
  const plans = await requestJson<{ plans: { id: string }[] }>('/api/billing/plans?include_org=true', {
    method: 'GET',
    token,
  })
  if (!plans.plans.length) {
    throw new Error('No subscription plans available. Seed a default plan before running verify.')
  }
  return plans.plans[0].id
}

async function subscribePlan(token: string, planId: string) {
  await requestJson('/api/billing/subscribe', {
    method: 'POST',
    token,
    body: JSON.stringify({ plan_id: planId }),
  })
  console.log('✓ billing subscribe')
}

async function verifyBilling(token: string) {
  const billing = await requestJson<{ has_subscription: boolean; subscription: { plan_id: string } | null }>(
    '/api/billing/me',
    {
      method: 'GET',
      token,
    }
  )
  assert.ok(billing.has_subscription, 'Subscription missing after subscribe')
}

async function verifyAuthMe(token: string) {
  const me = await requestJson<{ id: string; username: string }>('/api/v1/auth/me', {
    method: 'GET',
    token,
  })
  console.log('✓ /api/v1/auth/me', me.username)
  return me
}

async function chatFlow(token: string, userId: string) {
  const session = await requestJson<{ chat_id: string }>('/api/v1/chat/session', {
    method: 'POST',
    token,
  })
  const message = await requestJson<{ response: string }>('/api/v1/chat', {
    method: 'POST',
    token,
    body: JSON.stringify({ chat_id: session.chat_id, message: 'یک تست سیستمی خودکار. لطفاً پاسخ کوتاه بده.' }),
  })
  assert.ok(message.response?.length, 'Chat response empty')
  console.log('✓ /api/v1/chat responded')

  const historyList = await requestJson<{ chat_id: string }[]>(`/api/v1/history/${userId}`, {
    method: 'GET',
    token,
  })
  const found = historyList.find((c) => c.chat_id === session.chat_id)
  assert.ok(found, 'Chat not present in history list')

  const fullHistory = await requestJson<{ role: string; content: string }[]>(`/api/v1/history/${userId}/${session.chat_id}`, {
    method: 'GET',
    token,
  })
  assert.ok(fullHistory.length >= 2, 'History messages missing')

  const newTitle = 'گزارش تست'
  await requestJson(`/api/v1/history/${userId}/${session.chat_id}/title`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ title: newTitle }),
  })

  const deleteResp = await requestJson<{ message: string }>(`/api/v1/history/${userId}/${session.chat_id}`, {
    method: 'DELETE',
    token,
  })
  assert.ok(deleteResp.message, 'Delete response missing message')
  const afterDeleteList = await requestJson<{ chat_id: string }[]>(`/api/v1/history/${userId}`, {
    method: 'GET',
    token,
  })
  const stillThere = afterDeleteList.find((c) => c.chat_id === session.chat_id)
  assert.ok(!stillThere, 'Chat still present after delete')
  console.log('✓ history CRUD')
}

async function audioFlow(token: string) {
  if (SKIP_AUDIO) {
    console.log('⚠ audio tests skipped')
    return
  }
  const stt = await requestJson<{ text: string }>('/api/v1/audio/stt', {
    method: 'POST',
    token,
    body: JSON.stringify({ base64_audio: SAMPLE_AUDIO_BASE64, mime_type: 'audio/wav' }),
  })
  assert.ok(stt.text?.length, 'STT returned empty text')

  const audio = await requestBuffer('/api/v1/audio/tts', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'این یک تست است.', format: 'mp3' }),
  })
  assert.ok(audio.byteLength > 0, 'TTS audio empty')
  console.log('✓ audio endpoints')
}

async function main() {
  await verifyHealth()
  const token = await otpFlow()
  const me = await verifyAuthMe(token)
  const planId = await ensurePlan(token)
  await subscribePlan(token, planId)
  await verifyBilling(token)
  await chatFlow(token, me.id)
  await audioFlow(token)
  console.log('All verification steps passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
