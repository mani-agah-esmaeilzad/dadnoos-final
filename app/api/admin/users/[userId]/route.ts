import { NextRequest, NextResponse } from 'next/server'

import { requireAdminAuth } from '@/lib/admin/auth'
import { getAdminUserDetail } from '@/lib/admin/users'

export async function GET(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    await requireAdminAuth(req)
    const { userId } = await context.params
    const user = await getAdminUserDetail(userId)
    if (!user) {
      return NextResponse.json({ detail: 'کاربر یافت نشد.' }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
