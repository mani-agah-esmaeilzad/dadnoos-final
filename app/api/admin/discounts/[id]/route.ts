import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/admin/auth'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  description: z.string().trim().optional(),
  percentage: z.coerce.number().int().min(1).max(100).optional(),
  max_redemptions: z.coerce.number().int().positive().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  is_active: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminAuth(req)
    const { id } = await context.params
    const body = updateSchema.parse(await req.json())
    const discount = await prisma.discountCode.update({
      where: { id },
      data: {
        description: body.description,
        percentage: body.percentage,
        maxRedemptions: body.max_redemptions === undefined ? undefined : body.max_redemptions ?? null,
        expiresAt: body.expires_at === undefined ? undefined : body.expires_at ? new Date(body.expires_at) : null,
        isActive: body.is_active ?? undefined,
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
      updated_at: discount.updatedAt.toISOString(),
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

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminAuth(req)
    const { id } = await context.params
    await prisma.payment.updateMany({
      where: { discountId: id },
      data: { discountId: null },
    })
    await prisma.discountRedemption.deleteMany({ where: { discountId: id } })
    await prisma.discountCode.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
