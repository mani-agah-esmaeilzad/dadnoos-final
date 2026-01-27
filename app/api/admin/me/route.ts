import { NextRequest, NextResponse } from 'next/server'

import { requireAdminAuth } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuth(req)
    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
