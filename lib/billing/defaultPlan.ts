import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'

let ensured = false

export async function ensureDefaultPlan() {
  if (ensured) return
  const count = await prisma.subscriptionPlan.count()
  if (count === 0) {
    await prisma.subscriptionPlan.create({
      data: {
        code: env.DEFAULT_PLAN_CODE,
        title: env.DEFAULT_PLAN_TITLE,
        durationDays: env.DEFAULT_PLAN_DURATION_DAYS,
        tokenQuota: env.DEFAULT_PLAN_TOKEN_QUOTA,
        isOrganizational: false,
      },
    })
  }
  ensured = true
}
