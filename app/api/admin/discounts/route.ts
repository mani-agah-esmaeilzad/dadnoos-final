import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/admin/auth'
import { listDiscountCodes } from '@/lib/admin/discounts'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createSchema = z.object({
  code: z.string().trim().min(3),
  description: z.string().trim().optional(),
  percentage: z.coerce.number().int().min(1).max(100),
  max_redemptions: z.coerce.number().int().positive().optional(),
  expires_at: z.string().datetime().optional(),
})

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req)
    const discounts = await listDiscountCodes()
    return NextResponse.json({ discounts })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminAuth(req)
    const body = createSchema.parse(await req.json())
    const code = body.code.toUpperCase()

    const existing = await prisma.discountCode.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ detail: 'این کد قبلاً ثبت شده است.' }, { status: 409 })
    }

    const discount = await prisma.discountCode.create({
      data: {
        code,
        description: body.description,
        percentage: body.percentage,
        maxRedemptions: body.max_redemptions,
        expiresAt: body.expires_at ? new Date(body.expires_at) : undefined,
      },
    })

    return NextResponse.json({
      id: discount.id,
      code: discount.code,
      description: discount.description,
      percentage: discount.percentage,
      max_redemptions: discount.maxRedemptions,
      expires_at: discount.expiresAt?.toISOString() ?? null,
      is_active: discount.isActive,
      created_at: discount.createdAt.toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'درخواست نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const status = (error as { status?: number }).status ?? 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
