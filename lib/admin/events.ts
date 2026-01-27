import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'

export interface TrackingEventsQuery {
  page: number
  pageSize: number
  eventType?: string
  userId?: string
  from?: Date
  to?: Date
}

export async function listTrackingEvents({ page, pageSize, eventType, userId, from, to }: TrackingEventsQuery) {
  const where: Prisma.TrackingEventWhereInput = {}
  if (eventType) {
    where.eventType = eventType
  }
  if (userId) {
    where.userId = userId
  }
  if (from || to) {
    where.createdAt = {
      gte: from,
      lte: to,
    }
  }

  const [total, events] = await Promise.all([
    prisma.trackingEvent.count({ where }),
    prisma.trackingEvent.findMany({
      where,
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    total,
    page,
    pageSize,
    items: events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      userId: event.userId,
      username: event.user?.username ?? null,
      source: event.source,
      payload: event.payload,
      createdAt: event.createdAt,
    })),
  }
}
