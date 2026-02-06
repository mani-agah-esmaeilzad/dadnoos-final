import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/guards'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const isVercelBuild = process.env.VERCEL === '1' && process.env.NEXT_PHASE === 'phase-production-build'

export async function GET(req: NextRequest) {
  if (isVercelBuild) {
    return NextResponse.json({
      has_subscription: false,
      subscription: null,
      build_placeholder: true,
    })
  }

  try {
    const { getActiveSubscription } = await import('@/lib/billing/quota')
    const { getPlanMessageLimit } = await import('@/lib/billing/messageQuota')
    const { prisma } = await import('@/lib/db/prisma')
    const auth = requireAuth(req)
    const subscription = await getActiveSubscription(auth.sub)

    if (!subscription) {
      return NextResponse.json({ has_subscription: false, subscription: null })
    }

    const plan = subscription.planId
      ? await prisma.subscriptionPlan.findUnique({ where: { id: subscription.planId } })
      : null
    const messageQuota = getPlanMessageLimit(plan?.code)
    const messagesUsed = await prisma.message.count({
      where: {
        userId: auth.sub,
        role: 'user',
        timestamp: {
          gte: subscription.startedAt,
          lte: subscription.expiresAt,
        },
      },
    })

    const payload = {
      id: subscription.id,
      plan_id: subscription.planId,
      plan_code: plan?.code,
      plan_title: plan?.title,
      token_quota: subscription.tokenQuota,
      tokens_used: subscription.tokensUsed,
      remaining_tokens: subscription.tokenQuota - subscription.tokensUsed,
      message_quota: messageQuota,
      messages_used: messagesUsed,
      remaining_messages: Math.max(messageQuota - messagesUsed, 0),
      started_at: subscription.startedAt.toISOString(),
      expires_at: subscription.expiresAt.toISOString(),
      active: subscription.active,
      plan_price_cents: plan?.priceCents ?? 0,
      upgrade_from_subscription_id: (subscription as { upgradedFromId?: string | null })?.upgradedFromId ?? null,
    }

    return NextResponse.json({ has_subscription: true, subscription: payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Billing me endpoint failed:', message)
    return NextResponse.json(
      {
        has_subscription: false,
        subscription: null,
        detail: 'billing_me_unavailable',
      },
      { status: 200 }
    )
  }
}
