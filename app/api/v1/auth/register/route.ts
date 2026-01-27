import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { hashPassword } from '@/lib/auth/password'
import { issueAccessToken, asTokenResponse } from '@/lib/auth/jwt'
import { normalizePhone, isValidPhone, otpVerifiedKey } from '@/lib/auth/otp'
import { isBuildTime } from '@/lib/runtime/build'

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  phone: z.string().min(5),
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (isBuildTime) {
      return NextResponse.json({ detail: 'build placeholder', build_placeholder: true })
    }

    const [{ prisma }, { redis }] = await Promise.all([
      import('@/lib/db/prisma'),
      import('@/lib/redis/client'),
    ])

    const body = await req.json()
    const { username, password, phone } = registerSchema.parse(body)

    const normalized = normalizePhone(phone)
    if (!isValidPhone(normalized)) {
      return NextResponse.json({ detail: 'شماره موبایل نامعتبر است.' }, { status: 400 })
    }

    const verified = await redis.get(otpVerifiedKey(normalized))
    if (!verified) {
      return NextResponse.json({ detail: 'ابتدا شماره موبایل را تأیید کنید.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ detail: 'این نام کاربری قبلاً ثبت شده است.' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        passwordHash: await hashPassword(password),
      },
    })

    await redis.del(otpVerifiedKey(normalized))

    const issued = issueAccessToken({ sub: user.id })
    return NextResponse.json(asTokenResponse(issued))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : String(error)
    console.error('Register error', message)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
