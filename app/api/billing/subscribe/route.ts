import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth/guards'
import { env } from '@/lib/env'
import { ensurePlanCatalog } from '@/lib/billing/defaultPlan'
import { getPlanMessageLimit } from '@/lib/billing/messageQuota'
import { calculateMessageBasedCredit } from '@/lib/billing/upgradeCredit'

const bodySchema = z.object({
  plan_id: z.string().min(1),
  discount_code: z.string().trim().optional(),
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const isVercelBuild = process.env.VERCEL === '1' && process.env.NEXT_PHASE === 'phase-production-build'

export async function POST(req: NextRequest) {
  try {
    if (isVercelBuild) {
      const placeholderMessageQuota = getPlanMessageLimit(env.DEFAULT_PLAN_CODE)
      return NextResponse.json({
        id: 'build-placeholder',
        plan_id: env.DEFAULT_PLAN_CODE,
        plan_code: env.DEFAULT_PLAN_CODE,
        plan_title: env.DEFAULT_PLAN_TITLE,
        token_quota: env.DEFAULT_PLAN_TOKEN_QUOTA,
        tokens_used: 0,
        remaining_tokens: env.DEFAULT_PLAN_TOKEN_QUOTA,
        message_quota: placeholderMessageQuota,
        messages_used: 0,
        remaining_messages: placeholderMessageQuota,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + env.DEFAULT_PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        build_placeholder: true,
      })
    }

    const { prisma } = await import('@/lib/db/prisma')
    const auth = requireAuth(req)
    await ensurePlanCatalog()
    const body = bodySchema.parse(await req.json())

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: body.plan_id } })
    if (!plan) {
      return NextResponse.json({ detail: 'Plan not found.' }, { status: 404 })
    }

    const activeSubscription = await prisma.userSubscription.findFirst({
      where: { userId: auth.sub, active: true },
      include: { plan: true },
    })

    if (activeSubscription?.planId === plan.id) {
      return NextResponse.json({ detail: 'شما هم‌اکنون در همین پلن فعال هستید.' }, { status: 400 })
    }

    let upgradeCredit = 0
    let upgradeFromId: string | undefined
    if (activeSubscription) {
      const previousPrice = activeSubscription.plan?.priceCents ?? 0
      if (plan.priceCents <= previousPrice) {
        return NextResponse.json({ detail: 'فقط امکان ارتقا به پلن بالاتر وجود دارد.' }, { status: 400 })
      }
      const messageQuota = getPlanMessageLimit(activeSubscription.plan?.code)
      const messagesUsed = await prisma.trackingEvent.count({
        where: {
          userId: auth.sub,
          eventType: 'chat_request',
          source: 'api/v1/chat',
          createdAt: {
            gte: activeSubscription.startedAt,
            lte: new Date(),
          },
        },
      })
      upgradeCredit = calculateMessageBasedCredit({
        planPriceCents: previousPrice,
        messageQuota,
        messagesUsed,
      })
      upgradeFromId = activeSubscription.id
    }

    await prisma.userSubscription.updateMany({
      where: { userId: auth.sub, active: true },
      data: { active: false },
    })

    const grossAmount = Math.max(plan.priceCents - upgradeCredit, 0)
    let discountAmount = 0
    let appliedDiscount: { id: string; code: string; percentage: number } | null = null

    if (body.discount_code) {
      const discountCode = body.discount_code.trim().toUpperCase()
      const discount = await prisma.discountCode.findFirst({
        where: { code: discountCode },
      })
      if (!discount) {
        return NextResponse.json({ detail: 'کد تخفیف معتبر نیست.' }, { status: 400 })
      }
      if (!discount.isActive) {
        return NextResponse.json({ detail: 'کد تخفیف غیرفعال است.' }, { status: 400 })
      }
      if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
        return NextResponse.json({ detail: 'مهلت استفاده از کد تخفیف پایان یافته است.' }, { status: 400 })
      }
      if (discount.maxRedemptions) {
        const usage = await prisma.discountRedemption.count({ where: { discountId: discount.id } })
        if (usage >= discount.maxRedemptions) {
          return NextResponse.json({ detail: 'حداکثر استفاده از این کد انجام شده است.' }, { status: 400 })
        }
      }
      discountAmount = Math.floor((grossAmount * discount.percentage) / 100)
      if (discountAmount > grossAmount) {
        discountAmount = grossAmount
      }
      appliedDiscount = { id: discount.id, code: discount.code, percentage: discount.percentage }
    }

    const netAmount = Math.max(grossAmount - discountAmount, 0)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: auth.sub,
        planId: plan.id,
        tokenQuota: plan.tokenQuota,
        tokensUsed: 0,
        startedAt: now,
        expiresAt,
        active: true,
        priceCents: plan.priceCents,
        upgradedFromId: upgradeFromId,
      },
      include: { plan: true },
    })

    const payment = await prisma.payment.create({
      data: {
        userId: auth.sub,
        planId: plan.id,
        subscriptionId: subscription.id,
        discountId: appliedDiscount?.id,
        status: 'SUCCEEDED',
        grossAmount,
        discountAmount,
        netAmount,
        currency: 'IRR',
        upgradeFromSubscriptionId: upgradeFromId,
        metadata: upgradeFromId ? { upgradeCredit, creditSource: 'messages' } : undefined,
      },
      include: { discount: true },
    })

    if (appliedDiscount && discountAmount > 0) {
      await prisma.discountRedemption.create({
        data: {
          discountId: appliedDiscount.id,
          userId: auth.sub,
          paymentId: payment.id,
          percentage: appliedDiscount.percentage,
          amountOff: discountAmount,
        },
      })
    }

    const messageQuota = getPlanMessageLimit(subscription.plan?.code)

    const responsePayload = {
      id: subscription.id,
      plan_id: subscription.planId,
      plan_code: subscription.plan?.code,
      plan_title: subscription.plan?.title,
      token_quota: subscription.tokenQuota,
      tokens_used: subscription.tokensUsed,
      remaining_tokens: subscription.tokenQuota - subscription.tokensUsed,
      message_quota: messageQuota,
      messages_used: 0,
      remaining_messages: messageQuota,
      started_at: subscription.startedAt.toISOString(),
      expires_at: subscription.expiresAt.toISOString(),
      active: subscription.active,
      plan_price_cents: subscription.plan?.priceCents ?? 0,
      upgrade_credit_cents: upgradeFromId ? upgradeCredit : 0,
      upgrade_from_subscription_id: upgradeFromId ?? null,
      payment: {
        id: payment.id,
        gross_amount: payment.grossAmount,
        discount_amount: payment.discountAmount,
        net_amount: payment.netAmount,
        currency: payment.currency,
        discount_code: payment.discount?.code ?? null,
        status: payment.status,
        created_at: payment.createdAt.toISOString(),
      },
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'درخواست نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const status = (error as { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
