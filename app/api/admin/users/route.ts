import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/admin/auth'
import { listAdminUsers } from '@/lib/admin/users'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  query: z.string().optional(),
  status: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req)
    const parsed = querySchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const pageData = await listAdminUsers({
      page: parsed.page,
      pageSize: parsed.pageSize,
      query: parsed.query || undefined,
      status: parsed.status || undefined,
    })
    return NextResponse.json(pageData)
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
