import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyPassword } from '@/lib/auth/password'
import { issueAccessToken, asTokenResponse } from '@/lib/auth/jwt'
import { isBuildTime } from '@/lib/runtime/build'

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    if (isBuildTime) {
      return NextResponse.json({ detail: 'build placeholder', build_placeholder: true })
    }

    const { prisma } = await import('@/lib/db/prisma')

    const body = await req.json()
    const { username, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { username } })
    const isValid = user && (await verifyPassword(password, user.passwordHash))
    if (!user || !isValid) {
      return NextResponse.json({ detail: 'نام کاربری یا رمز عبور نادرست است.' }, { status: 401 })
    }

    const issued = issueAccessToken({ sub: user.id })
    return NextResponse.json(asTokenResponse(issued))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : String(error)
    console.error('Login error', message)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
