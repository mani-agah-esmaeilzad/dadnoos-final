import { prisma } from '@/lib/db/prisma'

export interface UsageQuery {
  from?: Date
  to?: Date
  userId?: string
  groupBy: 'day' | 'model' | 'module'
}

function parseGroupKey(record: { createdAt: Date; model: string | null; module: string | null }, groupBy: UsageQuery['groupBy']) {
  if (groupBy === 'day') {
    return record.createdAt.toISOString().slice(0, 10)
  }
  if (groupBy === 'model') {
    return record.model || 'unknown'
  }
  return record.module || 'unknown'
}

export async function getUsageBreakdown({ from, to, userId, groupBy }: UsageQuery) {
  const where: Record<string, unknown> = {}
  if (from || to) {
    where['createdAt'] = {
      gte: from,
      lte: to,
    }
  }
  if (userId) {
    where['userId'] = userId
  }
  const records = await prisma.tokenUsage.findMany({
    where,
    select: {
      createdAt: true,
      model: true,
      module: true,
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
    },
  })

  const buckets = new Map<
    string,
    {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  >()

  for (const record of records) {
    const key = parseGroupKey(record, groupBy)
    const bucket = buckets.get(key) || { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    bucket.promptTokens += record.promptTokens
    bucket.completionTokens += record.completionTokens
    bucket.totalTokens += record.totalTokens
    buckets.set(key, bucket)
  }

  return Array.from(buckets.entries())
    .map(([key, value]) => ({
      key,
      ...value,
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens)
}

export async function getTopUsageUsers({
  from,
  to,
  limit,
}: {
  from?: Date
  to?: Date
  limit: number
}) {
  const where: Record<string, unknown> = {}
  if (from || to) {
    where['createdAt'] = {
      gte: from,
      lte: to,
    }
  }
  const groups = await prisma.tokenUsage.groupBy({
    by: ['userId'],
    where,
    _sum: {
      totalTokens: true,
      promptTokens: true,
      completionTokens: true,
    },
    orderBy: {
      _sum: {
        totalTokens: 'desc',
      },
    },
    take: limit,
  })
  const users = await prisma.user.findMany({
    where: { id: { in: groups.map((g) => g.userId) } },
    select: { id: true, username: true },
  })
  const nameMap = new Map(users.map((user) => [user.id, user.username]))
  return groups.map((group) => ({
    userId: group.userId,
    username: nameMap.get(group.userId) || group.userId,
    totalTokens: group._sum.totalTokens ?? 0,
    promptTokens: group._sum.promptTokens ?? 0,
    completionTokens: group._sum.completionTokens ?? 0,
  }))
}

export async function getTopMessagingUsers({
  from,
  to,
  limit,
}: {
  from?: Date
  to?: Date
  limit: number
}) {
  const where: Record<string, unknown> = {}
  if (from || to) {
    where['timestamp'] = {
      gte: from,
      lte: to,
    }
  }
  const groups = await prisma.message.groupBy({
    by: ['userId'],
    where,
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  })
  const users = await prisma.user.findMany({
    where: { id: { in: groups.map((g) => g.userId) } },
    select: { id: true, username: true },
  })
  const nameMap = new Map(users.map((user) => [user.id, user.username]))
  return groups.map((group) => ({
    userId: group.userId,
    username: nameMap.get(group.userId) || group.userId,
    totalMessages: group._count._all ?? 0,
  }))
}
