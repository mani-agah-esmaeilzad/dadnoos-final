import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/lib/env'
import { BUILT_IN_PLANS, ensurePlanCatalog } from '@/lib/billing/defaultPlan'
import { getPlanMessageLimit } from '@/lib/billing/messageQuota'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const isVercelBuild = process.env.VERCEL === '1' && process.env.NEXT_PHASE === 'phase-production-build'

function buildFallbackPlans(includeOrg: boolean) {
  const plans = BUILT_IN_PLANS.map((plan) => ({
    id: `fallback-${plan.code}`,
    code: plan.code,
    title: plan.title,
    duration_days: plan.durationDays,
    token_quota: plan.tokenQuota,
    message_quota: getPlanMessageLimit(plan.code),
    is_organizational: plan.isOrganizational ?? false,
    price_cents: plan.priceCents,
  }))
  return includeOrg ? plans : plans.filter((plan) => !plan.is_organizational)
}

export async function GET(req: NextRequest) {
  const includeOrg = req.nextUrl.searchParams.get('include_org') === 'true'

  if (isVercelBuild) {
    return NextResponse.json({ plans: buildFallbackPlans(includeOrg), build_placeholder: true })
  }

  try {
    const { prisma } = await import('@/lib/db/prisma')
    await ensurePlanCatalog()
    const plans = await prisma.subscriptionPlan.findMany({
      where: includeOrg ? {} : { isOrganizational: false },
      orderBy: { createdAt: 'asc' },
    })

    const payload = plans.map((plan) => ({
      id: plan.id,
      code: plan.code,
      title: plan.title,
      duration_days: plan.durationDays,
      token_quota: plan.tokenQuota,
       message_quota: getPlanMessageLimit(plan.code),
      is_organizational: plan.isOrganizational,
      price_cents: plan.priceCents,
    }))
    return NextResponse.json({ plans: payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Billing plans query failed, using fallback response:', message)
    return NextResponse.json({ plans: buildFallbackPlans(includeOrg), detail: 'billing_plans_fallback' })
  }
}
