import type { NextRequest } from 'next/server'

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('X-Forwarded-For')
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim()
    if (ip) return ip
  }
  const realIp = req.headers.get('x-real-ip') || req.headers.get('X-Real-IP')
  if (realIp) return realIp
  return 'unknown'
}
