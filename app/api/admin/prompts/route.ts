import { NextRequest, NextResponse } from 'next/server'

import { requireAdminAuth } from '@/lib/admin/auth'
import { listAdminPrompts } from '@/lib/admin/prompts'

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req)
    const prompts = await listAdminPrompts()
    return NextResponse.json({ items: prompts })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
