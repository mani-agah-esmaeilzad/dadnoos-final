import { prisma } from '@/lib/db/prisma'
import { getTopMessagingUsers } from '@/lib/admin/usage'

interface DashboardRange {
  range?: '7d' | '30d'
  from?: Date
  to?: Date
}

export interface DashboardOverview {
  range: {
    label: '7d' | '30d'
    start: string
    end: string
  }
  metrics: {
    users: number
    conversations: number
    messages: number
    messagesUsage: {
      rangeTotal: number
      last30Days: number
    }
    tokens: {
      rangeTotal: number
      last30Days: number
    }
  }
  charts: {
    tokensPerDay: { date: string; totalTokens: number }[]
    messagesPerDay: { date: string; count: number }[]
    topUsers: {
      userId: string
      username: string
      totalMessages: number
    }[]
    moduleDistribution: { module: string; totalTokens: number }[]
  }
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

function addDays(date: Date, offset: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + offset)
  return next
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

async function sumTokensBetween(start: Date, end: Date) {
  const aggregate = await prisma.tokenUsage.aggregate({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    _sum: { totalTokens: true },
  })
  return aggregate._sum.totalTokens ?? 0
}

async function countMessagesBetween(start: Date, end: Date) {
  return prisma.message.count({
    where: {
      timestamp: {
        gte: start,
        lte: end,
      },
    },
  })
}

async function buildTokensPerDay(start: Date, end: Date) {
  const records = await prisma.tokenUsage.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      createdAt: true,
      totalTokens: true,
    },
  })
  const map = new Map<string, number>()
  for (const record of records) {
    const key = dayKey(record.createdAt)
    map.set(key, (map.get(key) ?? 0) + record.totalTokens)
  }
  const result: { date: string; totalTokens: number }[] = []
  let cursor = new Date(start)
  while (cursor <= end) {
    const key = dayKey(cursor)
    result.push({
      date: key,
      totalTokens: map.get(key) ?? 0,
    })
    cursor = addDays(cursor, 1)
  }
  return result
}

async function buildMessagesPerDay(start: Date, end: Date) {
  const records = await prisma.message.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end,
      },
    },
    select: { timestamp: true },
  })
  const map = new Map<string, number>()
  for (const record of records) {
    const key = dayKey(record.timestamp)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  const result: { date: string; count: number }[] = []
  let cursor = new Date(start)
  while (cursor <= end) {
    const key = dayKey(cursor)
    result.push({
      date: key,
      count: map.get(key) ?? 0,
    })
    cursor = addDays(cursor, 1)
  }
  return result
}

export async function getDashboardOverview(params: DashboardRange = {}): Promise<DashboardOverview> {
  const now = new Date()
  const rangeLabel = params.range ?? '7d'
  const rangeDays = rangeLabel === '30d' ? 30 : 7
  const defaultStart = addDays(now, -1 * (rangeDays - 1))
  const startDate = startOfDay(params.from ?? defaultStart)
  const endDate = endOfDay(params.to ?? now)

  const thirtyDaysAgo = startOfDay(addDays(now, -29))

  const [
    users,
    conversations,
    messages,
    tokensRange,
    tokens30d,
    tokensPerDay,
    messagesPerDay,
    topUsers,
    moduleGroups,
    messages30d,
  ] =
    await Promise.all([
      prisma.user.count(),
      prisma.chatSession.count(),
      prisma.message.count(),
      sumTokensBetween(startDate, endDate),
      sumTokensBetween(thirtyDaysAgo, endOfDay(now)),
      buildTokensPerDay(startDate, endDate),
      buildMessagesPerDay(startDate, endDate),
      getTopMessagingUsers({ from: startDate, to: endDate, limit: 5 }),
      prisma.tokenUsage.groupBy({
        by: ['module'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          totalTokens: true,
        },
      }),
      countMessagesBetween(thirtyDaysAgo, endOfDay(now)),
    ])

  const moduleDistribution = moduleGroups
    .map((group) => ({
      module: group.module || 'unknown',
      totalTokens: group._sum.totalTokens ?? 0,
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens)

  const messagesRangeTotal = messagesPerDay.reduce((sum, day) => sum + day.count, 0)

  return {
    range: {
      label: rangeLabel,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    metrics: {
      users,
      conversations,
      messages,
      messagesUsage: {
        rangeTotal: messagesRangeTotal,
        last30Days: messages30d,
      },
      tokens: {
        rangeTotal: tokensRange,
        last30Days: tokens30d,
      },
    },
    charts: {
      tokensPerDay,
      messagesPerDay,
      topUsers,
      moduleDistribution,
    },
  }
}
