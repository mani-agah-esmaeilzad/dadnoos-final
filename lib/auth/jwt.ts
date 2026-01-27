import jwt from 'jsonwebtoken'

import { env } from '@/lib/env'

const ALGORITHM: jwt.Algorithm = 'HS256'

export interface AccessTokenClaims extends jwt.JwtPayload {
  sub: string
  scope?: string
}

export interface IssueTokenParams {
  sub: string
  ttlHours?: number
  scope?: string
  extra?: jwt.JwtPayload
}

export interface IssuedToken {
  token: string
  expiresAt: Date
  expiresInSeconds: number
}

export function issueAccessToken(params: IssueTokenParams): IssuedToken {
  const ttlHours = params.ttlHours ?? env.TOKEN_DEFAULT_TTL_HOURS
  const now = Math.floor(Date.now() / 1000)
  const expiresInSeconds = Math.floor(ttlHours * 3600)
  const exp = now + expiresInSeconds

  const payload: AccessTokenClaims = {
    sub: params.sub,
    scope: params.scope,
    iat: now,
    exp,
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
    ...params.extra,
  }

  const token = jwt.sign(payload, env.JWT_SECRET, {
    algorithm: ALGORITHM,
  })

  return {
    token,
    expiresAt: new Date(exp * 1000),
    expiresInSeconds,
  }
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    algorithms: [ALGORITHM],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  })
  return payload as AccessTokenClaims
}

export function asTokenResponse(issued: IssuedToken) {
  return {
    access_token: issued.token,
    token_type: 'bearer' as const,
    expires_at: issued.expiresAt.toISOString(),
    expires_in: issued.expiresInSeconds,
  }
}
