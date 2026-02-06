import { env } from '@/lib/env'

const DEFAULT_MESSAGE_LIMIT = 50

const PLAN_MESSAGE_LIMITS: Record<string, number> = {
  [env.DEFAULT_PLAN_CODE]: 15,
  PLAN_MONTHLY: 300,
  PLAN_SEMI_ANNUAL: 2000,
  PLAN_YEARLY: 5000,
}

export function getPlanMessageLimit(planCode?: string | null) {
  if (!planCode) return DEFAULT_MESSAGE_LIMIT
  return PLAN_MESSAGE_LIMITS[planCode] ?? DEFAULT_MESSAGE_LIMIT
}
