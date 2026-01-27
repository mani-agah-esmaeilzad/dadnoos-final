import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const isVercelBuild = process.env.VERCEL === '1' && process.env.NEXT_PHASE === 'phase-production-build'

const FALLBACK_PLAN = {
  id: `fallback-${env.DEFAULT_PLAN_CODE}`,
  code: env.DEFAULT_PLAN_CODE,
  title: env.DEFAULT_PLAN_TITLE,
  duration_days: env.DEFAULT_PLAN_DURATION_DAYS,
  token_quota: env.DEFAULT_PLAN_TOKEN_QUOTA,
  is_organizational: false,
}

function buildFallbackPlans(includeOrg: boolean) {
  if (includeOrg) {
    return [FALLBACK_PLAN]
  }
  return [FALLBACK_PLAN].filter((plan) => !plan.is_organizational)
}

export async function GET(req: NextRequest) {
  const includeOrg = req.nextUrl.searchParams.get('include_org') === 'true'

  if (isVercelBuild) {
    return NextResponse.json({ plans: buildFallbackPlans(includeOrg), build_placeholder: true })
  }

  try {
    const { ensureDefaultPlan } = await import('@/lib/billing/defaultPlan')
    const { prisma } = await import('@/lib/db/prisma')
    await ensureDefaultPlan()
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
      is_organizational: plan.isOrganizational,
    }))
    return NextResponse.json({ plans: payload })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Billing plans query failed, using fallback response:', message)
    return NextResponse.json({ plans: buildFallbackPlans(includeOrg), detail: 'billing_plans_fallback' })
  }
}
