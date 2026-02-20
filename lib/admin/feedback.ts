import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'

export interface FeedbackListParams {
  page: number
  pageSize: number
  query?: string
  userId?: string
  status?: 'NEW' | 'REVIEWED' | 'RESOLVED'
  type?: 'IDEA' | 'REPORT'
  from?: Date
  to?: Date
}

export async function listFeedback({
  page,
  pageSize,
  query,
  userId,
  status,
  type,
  from,
  to,
}: FeedbackListParams) {
  const feedbackDelegate = (prisma as typeof prisma & { feedback?: typeof prisma.feedback }).feedback
  if (!feedbackDelegate) {
    console.warn('[admin-feedback] Prisma client is missing Feedback model. Run "npx prisma generate".')
    return {
      total: 0,
      page,
      pageSize,
      items: [],
    }
  }
  const where: Prisma.FeedbackWhereInput = {}

  if (userId) {
    where.userId = userId
  }

  if (status) {
    where.status = status
  }

  if (type) {
    where.type = type
  }

  if (from || to) {
    where.createdAt = {
      gte: from,
      lte: to,
    }
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { message: { contains: query, mode: 'insensitive' } },
      { user: { username: { contains: query, mode: 'insensitive' } } },
    ]
  }

  const [total, feedbacks] = await Promise.all([
    feedbackDelegate.count({ where }),
    feedbackDelegate.findMany({
      where,
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    total,
    page,
    pageSize,
    items: feedbacks.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: item.user?.username ?? null,
      type: item.type,
      status: item.status,
      title: item.title,
      message: item.message,
      createdAt: item.createdAt,
    })),
  }
}
