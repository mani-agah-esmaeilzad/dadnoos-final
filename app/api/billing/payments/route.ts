import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/guards'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req)
    const payments = await prisma.payment.findMany({
      where: { userId: auth.sub },
      include: {
        plan: true,
        discount: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const payload = payments.map((payment) => ({
      id: payment.id,
      plan_id: payment.planId,
      plan_code: payment.plan?.code,
      plan_title: payment.plan?.title,
      gross_amount: payment.grossAmount,
      discount_amount: payment.discountAmount,
      net_amount: payment.netAmount,
      currency: payment.currency,
      status: payment.status,
      discount_code: payment.discount?.code ?? null,
      upgrade_from_subscription_id: payment.upgradeFromSubscriptionId,
      created_at: payment.createdAt.toISOString(),
    }))

    return NextResponse.json({ payments: payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status: 500 })
  }
}
