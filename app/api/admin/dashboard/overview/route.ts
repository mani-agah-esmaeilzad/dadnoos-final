import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/admin/auth'
import { getDashboardOverview } from '@/lib/admin/dashboard'

const querySchema = z.object({
  range: z.enum(['7d', '30d']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
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
    const data = await getDashboardOverview({
      range: parsed.range,
      from: parseDate(parsed.from),
      to: parseDate(parsed.to),
    })
    return NextResponse.json(data)
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
