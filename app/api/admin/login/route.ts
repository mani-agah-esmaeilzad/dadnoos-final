import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { ensureBootstrapAdmin } from '@/lib/admin/bootstrap'
import {
  buildAdminSessionCookie,
  createSessionToken,
  persistAdminSession,
} from '@/lib/admin/session'
import { enforceRateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
})

function getClientIp(req: NextRequest) {
  const requestWithIp = req as NextRequest & { ip?: string }
  return (
    requestWithIp.ip ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    await ensureBootstrapAdmin()

    const body = loginSchema.parse(await req.json())
    const identifier = body.identifier.toLowerCase().trim()

    const clientIp = getClientIp(req)
    await enforceRateLimit({
      key: `ratelimit:admin:login:${clientIp}`,
      limit: 5,
      windowSeconds: 60,
    })

    const admin = await prisma.adminUser.findUnique({
      where: { email: identifier },
    })

    const valid =
      admin &&
      admin.status === 'active' &&
      (await verifyPassword(body.password, admin.passwordHash))

    if (!admin || !valid) {
      return NextResponse.json({ detail: 'اطلاعات ورود نامعتبر است.' }, { status: 401 })
    }

    const token = createSessionToken()
    const expiresAt = await persistAdminSession({
      adminId: admin.id,
      token,
      ipAddress: clientIp,
      userAgent: req.headers.get('user-agent'),
    })

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    const response = NextResponse.json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    })

    response.cookies.set(buildAdminSessionCookie(token, expiresAt))
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    console.error('Admin login error', error)
    return NextResponse.json({ detail: 'خطای داخلی سرور' }, { status: 500 })
  }
}
