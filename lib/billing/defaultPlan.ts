import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'

interface PlanSeed {
  code: string
  title: string
  durationDays: number
  tokenQuota: number
  priceCents: number
  isOrganizational?: boolean
}

export const BUILT_IN_PLANS: PlanSeed[] = [
  {
    code: env.DEFAULT_PLAN_CODE,
    title: env.DEFAULT_PLAN_TITLE,
    durationDays: env.DEFAULT_PLAN_DURATION_DAYS,
    tokenQuota: env.DEFAULT_PLAN_TOKEN_QUOTA,
    priceCents: env.DEFAULT_PLAN_PRICE_CENTS,
    isOrganizational: false,
  },
  {
    code: 'PLAN_MONTHLY',
    title: 'اشتراک یک‌ماهه',
    durationDays: 30,
    tokenQuota: 300000,
    priceCents: 385000,
    isOrganizational: false,
  },
  {
    code: 'PLAN_SEMI_ANNUAL',
    title: 'اشتراک شش‌ماهه',
    durationDays: 180,
    tokenQuota: 1800000,
    priceCents: 1850000,
    isOrganizational: false,
  },
  {
    code: 'PLAN_YEARLY',
    title: 'اشتراک یک‌ساله',
    durationDays: 365,
    tokenQuota: 3600000,
    priceCents: 2750000,
    isOrganizational: false,
  },
]

let ensured = false

export async function ensurePlanCatalog() {
  if (ensured) return
  for (const plan of BUILT_IN_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {},
      create: {
        code: plan.code,
        title: plan.title,
        durationDays: plan.durationDays,
        tokenQuota: plan.tokenQuota,
        priceCents: plan.priceCents,
        isOrganizational: plan.isOrganizational ?? false,
      },
    })
  }
  ensured = true
}

export async function ensureDefaultPlan() {
  await ensurePlanCatalog()
}
