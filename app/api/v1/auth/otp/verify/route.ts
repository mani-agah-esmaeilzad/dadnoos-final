import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/lib/env'
import { issueAccessToken, asTokenResponse } from '@/lib/auth/jwt'
import { normalizePhone, isValidPhone, otpAttemptsKey, otpKey, otpVerifiedKey } from '@/lib/auth/otp'
import { isBuildTime } from '@/lib/runtime/build'

const verifySchema = z.object({
  phone: z.string().min(5),
  code: z.string().min(4).max(16),
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

    const ensureUser = async (phone: string) => {
      const existing = await prisma.user.findFirst({ where: { username: phone } })
      if (existing) return existing
      return prisma.user.create({
        data: {
          username: phone,
        },
      })
    }

    const body = await req.json()
    const { phone, code } = verifySchema.parse(body)

    const normalized = normalizePhone(phone)
    if (!isValidPhone(normalized)) {
      return NextResponse.json({ detail: 'فرمت شماره موبایل نامعتبر است.' }, { status: 400 })
    }

    const staticPhone = env.OTP_STATIC_LOGIN_PHONE && normalizePhone(env.OTP_STATIC_LOGIN_PHONE)
    const staticCode = env.OTP_STATIC_LOGIN_CODE || env.OTP_FIXED_CODE

    const trimmedCode = code.trim()

    let verified = false
    if (env.OTP_DEV_MODE && trimmedCode === env.OTP_FIXED_CODE) {
      verified = true
    } else if (staticPhone && normalized === staticPhone && trimmedCode === staticCode) {
      verified = true
    } else if (env.OTP_BYPASS_IN_DEV && env.OTP_ACCEPT_MASTER_CODE && trimmedCode === env.OTP_FIXED_CODE) {
      verified = true
    } else {
      let realCode: string | null = null
      try {
        realCode = await redis.get(otpKey(normalized))
      } catch (error) {
        console.error('OTP verify redis error:', (error as Error).message)
        return NextResponse.json(
          { detail: 'سرویس تایید کد موقتا در دسترس نیست. لطفاً دوباره تلاش کنید.' },
          { status: 503 }
        )
      }
      if (!realCode) {
        return NextResponse.json({ detail: 'کد منقضی شده یا درخواستی ثبت نشده است.' }, { status: 400 })
      }

      let attemptsRaw: string | null = null
      try {
        attemptsRaw = await redis.get(otpAttemptsKey(normalized))
      } catch (error) {
        console.error('OTP attempts redis error:', (error as Error).message)
      }
      const attemptsLeft = attemptsRaw ? parseInt(attemptsRaw, 10) : env.OTP_MAX_ATTEMPTS
      if (attemptsLeft <= 0) {
        await redis.del(otpKey(normalized), otpAttemptsKey(normalized)).catch(() => {})
        return NextResponse.json({ detail: 'تعداد تلاش‌ها به پایان رسیده است.' }, { status: 429 })
      }

      if (realCode.trim() !== trimmedCode) {
        await redis.decr(otpAttemptsKey(normalized)).catch(() => {})
        return NextResponse.json({ detail: 'کد نادرست است.' }, { status: 401 })
      }

      verified = true
      await redis.del(otpKey(normalized), otpAttemptsKey(normalized)).catch(() => {})
    }

    if (!verified) {
      return NextResponse.json({ detail: 'کد نادرست است.' }, { status: 401 })
    }

    await redis.setex(otpVerifiedKey(normalized), 600, '1').catch((error) => {
      console.warn('OTP verified flag could not be stored:', (error as Error).message)
    })

    const user = await ensureUser(normalized)
    const issued = issueAccessToken({ sub: user.id })
    const response = asTokenResponse(issued)
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : String(error)
    console.error('OTP verify error', message)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
