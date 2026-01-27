import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/admin/auth'
import { getTopUsageUsers } from '@/lib/admin/usage'

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(5),
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
    const now = new Date()
    const defaultFrom = new Date(now)
    defaultFrom.setDate(now.getDate() - 7)
    const fromDate = parseDate(parsed.from) ?? defaultFrom
    const toDate = parseDate(parsed.to) ?? now
    const items = await getTopUsageUsers({
      from: fromDate,
      to: toDate,
      limit: parsed.limit,
    })
    return NextResponse.json({
      range: { from: fromDate.toISOString(), to: toDate.toISOString() },
      items,
    })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
