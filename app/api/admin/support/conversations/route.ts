import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/admin/auth'
import { listSupportConversations } from '@/lib/admin/support'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  query: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  flag: z.enum(['any', 'support', 'reported']).optional(),
})

function parseDate(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? undefined : date
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req)
    const parsed = querySchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await listSupportConversations({
      page: parsed.page,
      pageSize: parsed.pageSize,
      query: parsed.query || undefined,
      userId: parsed.userId || undefined,
      from: parseDate(parsed.from),
      to: parseDate(parsed.to),
      flag: parsed.flag || undefined,
    })
    return NextResponse.json(data)
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
