import { NextRequest } from 'next/server'

import { asTokenResponse, issueAccessToken, verifyAccessToken } from '@/lib/auth/jwt'
import { HttpError } from '@/lib/http/errors'

export function extractBearerToken(req: NextRequest): string {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw new HttpError(401, 'Authorization header missing or invalid')
  }
  return authHeader.slice(7).trim()
}

export function requireAuth(req: NextRequest) {
  const token = extractBearerToken(req)
  try {
    return verifyAccessToken(token)
  } catch (error) {
    throw new HttpError(401, 'Invalid or expired token')
  }
}

export { asTokenResponse, issueAccessToken }
