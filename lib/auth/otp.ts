import crypto from 'crypto'

import { env } from '@/lib/env'

const PHONE_RE = /^09\d{9}$/
const redisPrefix = env.APP_NAME.replace(/\s+/g, '').toUpperCase()

export function normalizePhone(input: string): string {
  const digits = (input || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('989') && digits.length === 12) {
    return `0${digits.slice(2)}`
  }
  if (digits.startsWith('9') && digits.length === 10) {
    return `0${digits}`
  }
  if (digits.startsWith('09') && digits.length === 11) {
    return digits
  }
  return input.trim()
}

export function isValidPhone(phone: string): boolean {
  return PHONE_RE.test(phone)
}

export function otpKey(phone: string) {
  return `${redisPrefix}:otp:${phone}`
}

export function otpAttemptsKey(phone: string) {
  return `${redisPrefix}:otp:${phone}:attempts`
}

export function otpCooldownKey(phone: string) {
  return `${redisPrefix}:otp:${phone}:cooldown`
}

export function otpVerifiedKey(phone: string) {
  return `${redisPrefix}:otp:${phone}:verified`
}

export function generateOtpCode(): string {
  return crypto.randomInt(0, 100_000).toString().padStart(5, '0')
}
