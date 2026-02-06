import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/lib/env'
import { generateOtpCode, isValidPhone, normalizePhone, otpAttemptsKey, otpCooldownKey, otpKey } from '@/lib/auth/otp'
import { redis } from '@/lib/redis/client'
import { isBuildTime } from '@/lib/runtime/build'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/http/request'
import { sendOtp, MeliPayamakError } from '@/lib/integrations/melipayamak'

const requestSchema = z.object({
  phone: z.string().min(5),
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (isBuildTime) {
      return NextResponse.json({
        sent: true,
        provider: 'dev',
        request_id: 'BUILD-MODE',
        expires_in: env.OTP_TTL_SECONDS,
        cooldown: env.OTP_COOLDOWN_SECONDS,
        dev_code: env.OTP_FIXED_CODE,
        build_placeholder: true,
      })
    }

    const body = await req.json()
    const { phone } = requestSchema.parse(body)
    const normalized = normalizePhone(phone)
    if (!isValidPhone(normalized)) {
      return NextResponse.json({ detail: 'فرمت شماره موبایل نامعتبر است.' }, { status: 400 })
    }

    const ip = getClientIp(req)
    await enforceRateLimit({
      key: `ratelimit:otp:req:${ip}`,
      limit: env.RATE_LIMIT_MAX_REQUESTS,
      windowSeconds: env.RATE_LIMIT_WINDOW_SEC,
    })

    const ttl = env.OTP_TTL_SECONDS
    const attempts = env.OTP_MAX_ATTEMPTS
    const requireRedis = !(env.OTP_DEV_MODE || env.OTP_BYPASS_IN_DEV)

    if (requireRedis) {
      try {
        const cooldown = await redis.get(otpCooldownKey(normalized))
        if (cooldown) {
          return NextResponse.json({ detail: 'لطفاً کمی بعد دوباره تلاش کنید.' }, { status: 429 })
        }
      } catch (error) {
        console.error('OTP cooldown redis error:', (error as Error).message)
        return NextResponse.json(
          { detail: 'سرویس ارسال کد موقتا در دسترس نیست. لطفاً دقایقی بعد تلاش کنید.' },
          { status: 503 }
        )
      }
    }

    let code: string
    let provider = 'dev'
    let requestId = `REQ-${Date.now()}`
    let sent = false

    if (env.OTP_DEV_MODE) {
      code = env.OTP_FIXED_CODE
      provider = 'dev'
      sent = true
      requestId = 'DEV-MODE'
    } else if (env.OTP_STATIC_LOGIN_PHONE && normalizePhone(env.OTP_STATIC_LOGIN_PHONE) === normalized) {
      code = env.OTP_STATIC_LOGIN_CODE || env.OTP_FIXED_CODE
      provider = 'static'
    } else if (env.OTP_BYPASS_IN_DEV) {
      code = env.OTP_FIXED_CODE
      provider = 'dev'
      sent = true
      requestId = 'DEV-MODE'
    } else {
      try {
        const res = await sendOtp(normalized)
        code = res.code
        requestId = res.requestId
        provider = 'melipayamak'
        sent = true
      } catch (error) {
        if (error instanceof MeliPayamakError) {
          return NextResponse.json({ detail: error.message }, { status: 502 })
        }
        throw error
      }
    }

    if (!sent && !env.OTP_BYPASS_IN_DEV) {
      // fallback to internally generated code when provider isn't configured.
      code = code || generateOtpCode()
    }

    if (requireRedis) {
      try {
        await redis
          .multi()
          .setex(otpKey(normalized), ttl, code)
          .setex(otpAttemptsKey(normalized), ttl, attempts.toString())
          .exec()

        await redis.setex(otpCooldownKey(normalized), env.OTP_COOLDOWN_SECONDS, '1')
      } catch (error) {
        console.error('OTP redis error:', (error as Error).message)
        return NextResponse.json(
          { detail: 'سرویس ارسال کد موقتا در دسترس نیست. لطفاً دقایقی بعد تلاش کنید.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json({
      sent,
      provider,
      request_id: requestId,
      expires_in: ttl,
      cooldown: env.OTP_COOLDOWN_SECONDS,
      ...(env.OTP_BYPASS_IN_DEV ? { _debug_code: code } : {}),
      ...(env.OTP_DEV_MODE ? { dev_code: code } : {}),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : String(error)
    console.error('OTP request error', message)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
