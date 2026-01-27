import { env } from '@/lib/env'

export class MeliPayamakError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export async function sendOtp(to: string) {
  if (!env.MELIPAYAMAK_OTP_TOKEN) {
    throw new MeliPayamakError('MELIPAYAMAK_OTP_TOKEN is not configured')
  }

  const baseUrl = (env.MELIPAYAMAK_OTP_BASE_URL || 'https://console.melipayamak.com').replace(/\/$/, '')
  const url = `${baseUrl}/api/send/otp/${env.MELIPAYAMAK_OTP_TOKEN}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'dadnoos/otp-client',
    },
    body: JSON.stringify({ to }),
  })

  if (!response.ok) {
    throw new MeliPayamakError(`OTP provider error (${response.status})`)
  }

  const data = (await response.json().catch(() => ({}))) as { code?: string; status?: string; request_id?: string }
  const code = (data?.code || '').trim()
  if (!code) {
    throw new MeliPayamakError(data?.status || 'OTP provider returned no code')
  }

  return {
    code,
    requestId: data?.request_id || Date.now().toString(),
  }
}
