import { NextRequest, NextResponse } from 'next/server'

import {
  ADMIN_SESSION_COOKIE,
  buildClearedAdminSessionCookie,
  deleteAdminSessionByToken,
} from '@/lib/admin/session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
    await deleteAdminSessionByToken(token)
    const response = NextResponse.json({ ok: true })
    response.cookies.set(buildClearedAdminSessionCookie())
    return response
  } catch (error) {
    console.error('Admin logout error', error)
    return NextResponse.json({ detail: 'خطای داخلی سرور' }, { status: 500 })
  }
}
