import crypto from 'node:crypto'

import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'
import { AdminRole } from '@prisma/client'
import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'dadnoos_admin_session'

const SESSION_TOKEN_BYTES = 48

function hashSessionToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function createSessionToken() {
  return crypto.randomBytes(SESSION_TOKEN_BYTES).toString('hex')
}

export async function persistAdminSession({
  adminId,
  token,
  ipAddress,
  userAgent,
}: {
  adminId: string
  token: string
  ipAddress?: string | null
  userAgent?: string | null
}) {
  const expiresAt = new Date(Date.now() + env.ADMIN_SESSION_TTL_HOURS * 3600 * 1000)
  await prisma.adminSession.create({
    data: {
      adminId,
      sessionToken: hashSessionToken(token),
      expiresAt,
      lastIp: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    },
  })
  return expiresAt
}

export async function deleteAdminSessionByToken(token?: string | null) {
  if (!token) return
  await prisma.adminSession.deleteMany({
    where: { sessionToken: hashSessionToken(token) },
  })
}

export async function getAdminSession(token?: string | null) {
  if (!token) return null
  const session = await prisma.adminSession.findUnique({
    where: { sessionToken: hashSessionToken(token) },
    include: { admin: true },
  })
  if (!session) return null
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } })
    return null
  }
  if (session.admin.status !== 'active') {
    return null
  }

  return session
}

export function buildAdminSessionCookie(token: string, expiresAt: Date) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: true,
    expires: expiresAt,
    path: '/',
  }
}

export function buildClearedAdminSessionCookie() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: true,
    expires: new Date(0),
    path: '/',
  }
}

export type AdminWithRole = {
  id: string
  email: string
  role: AdminRole
  status: string
}

export async function getAdminFromCookies() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  const session = await getAdminSession(token)
  if (!session) return null
  return session.admin
}
