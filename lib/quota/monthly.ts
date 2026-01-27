import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'
import { HttpError } from '@/lib/http/errors'
import { recordTrackingEvent } from '@/lib/tracking/events'
import { startOfCurrentMonth, startOfNextMonth } from '@/lib/quota/utils'

const QUOTA_ERROR_MESSAGE = 'سقف توکن اشتراک شما تمام شده است.'

async function fetchUserQuota(userId: string) {
  let quota = await prisma.userQuota.findUnique({ where: { userId } })
  const now = new Date()
  if (!quota) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyTokenQuota: true },
    })
    const monthlyQuota = user?.monthlyTokenQuota ?? env.DEFAULT_PLAN_TOKEN_QUOTA
    quota = await prisma.userQuota.create({
      data: {
        userId,
        monthlyQuota,
        monthlyUsed: 0,
        periodStart: startOfCurrentMonth(now),
        resetAt: startOfNextMonth(now),
      },
    })
  }

  if (quota.resetAt <= now) {
    quota = await prisma.userQuota.update({
      where: { userId },
      data: {
        monthlyUsed: 0,
        periodStart: startOfCurrentMonth(now),
        resetAt: startOfNextMonth(now),
      },
    })
  }

  return quota
}

export async function enforceMonthlyQuota(userId: string, requestedTokens: number) {
  if (requestedTokens <= 0) return
  const quota = await fetchUserQuota(userId)
  if (!quota.monthlyQuota || quota.monthlyQuota <= 0) {
    return
  }
  const remaining = quota.monthlyQuota - quota.monthlyUsed
  if (remaining < requestedTokens) {
    await recordTrackingEvent({
      userId,
      eventType: 'quota_block',
      source: 'monthly_quota',
      payload: {
        remaining,
        requested: requestedTokens,
        quota: quota.monthlyQuota,
      },
    })
    throw new HttpError(402, QUOTA_ERROR_MESSAGE)
  }
}

export async function addMonthlyUsage(userId: string, usedTokens: number) {
  if (usedTokens <= 0) return
  await fetchUserQuota(userId)
  await prisma.userQuota.update({
    where: { userId },
    data: { monthlyUsed: { increment: usedTokens } },
  })
  await prisma.user.update({
    where: { id: userId },
    data: { monthlyTokenUsed: { increment: usedTokens } },
  })
}

export async function updateMonthlyQuota(userId: string, monthlyQuota: number) {
  await fetchUserQuota(userId)
  await prisma.userQuota.upsert({
    where: { userId },
    update: { monthlyQuota },
    create: {
      userId,
      monthlyQuota,
      monthlyUsed: 0,
      periodStart: startOfCurrentMonth(),
      resetAt: startOfNextMonth(),
    },
  })
  await prisma.user.update({
    where: { id: userId },
    data: { monthlyTokenQuota: monthlyQuota },
  })
}

export async function getMonthlyQuota(userId: string) {
  return fetchUserQuota(userId)
}

export const quotaErrorMessage = QUOTA_ERROR_MESSAGE
