import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'
import { HttpError } from '@/lib/http/errors'

export async function getActiveSubscription(userId: string) {
  const now = new Date()
  return prisma.userSubscription.findFirst({
    where: {
      userId,
      active: true,
      startedAt: { lte: now },
      expiresAt: { gte: now },
    },
    orderBy: { startedAt: 'desc' },
  })
}

export async function enforceQuota(userId: string, estimatedTokens: number) {
  if (!env.BILLING_REQUIRE_SUBSCRIPTION) {
    return null
  }
  const subscription = await getActiveSubscription(userId)
  if (!subscription) {
    throw new HttpError(402, 'هیچ اشتراک فعالی یافت نشد.')
  }
  const remaining = subscription.tokenQuota - subscription.tokensUsed
  if (remaining <= 0 || remaining < estimatedTokens) {
    throw new HttpError(402, 'سقف توکن اشتراک شما تمام شده است.')
  }
  return subscription
}

export async function recordUsage(userId: string, usedTokens: number) {
  if (usedTokens <= 0 || !env.BILLING_REQUIRE_SUBSCRIPTION) {
    return
  }
  const subscription = await getActiveSubscription(userId)
  if (!subscription) return
  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: { tokensUsed: { increment: usedTokens } },
  })
}
