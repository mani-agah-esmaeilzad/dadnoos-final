import { NextRequest } from 'next/server'

import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'
import { recordTrackingEvent } from '@/lib/tracking/events'

interface AuditActionInput {
  adminId: string
  actionType: string
  entityType: string
  entityId?: string | null
  before?: unknown
  after?: unknown
  meta?: Record<string, unknown>
}

export function buildAuditMeta(req?: NextRequest, extra?: Record<string, unknown>) {
  const requestWithIp = req as NextRequest & { ip?: string }
  const ip =
    req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req?.headers.get('x-real-ip') ||
    requestWithIp?.ip ||
    undefined
  const userAgent = req?.headers.get('user-agent') || undefined
  return {
    ip,
    userAgent,
    ...extra,
  }
}

export async function logAdminAction({
  adminId,
  actionType,
  entityType,
  entityId,
  before,
  after,
  meta,
}: AuditActionInput) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        actionType,
        entityType,
        entityId: entityId ?? null,
        beforeJson: before ? (before as Prisma.InputJsonValue) : undefined,
        afterJson: after ? (after as Prisma.InputJsonValue) : undefined,
        metaJson: meta ? (meta as Prisma.InputJsonValue) : undefined,
      },
    })
    await recordTrackingEvent({
      eventType: 'admin_action',
      userId: entityType === 'user' && entityId ? entityId : undefined,
      source: 'admin_api',
      payload: {
        adminId,
        actionType,
        entityType,
        entityId,
      },
    })
  } catch (error) {
    console.warn('Failed to record admin audit log', actionType, (error as Error).message)
  }
}

interface AuditLogQuery {
  page: number
  pageSize: number
  adminId?: string
  actionType?: string
  from?: Date
  to?: Date
}

export async function listAuditLogs({ page, pageSize, adminId, actionType, from, to }: AuditLogQuery) {
  const where: Record<string, unknown> = {}
  if (adminId) {
    where['adminId'] = adminId
  }
  if (actionType) {
    where['actionType'] = actionType
  }
  if (from || to) {
    where['createdAt'] = {
      gte: from,
      lte: to,
    }
  }

  const [total, records] = await Promise.all([
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { email: true, role: true },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const items = records.map((log) => ({
    id: log.id,
    actionType: log.actionType,
    entityType: log.entityType,
    entityId: log.entityId,
    createdAt: log.createdAt,
    adminId: log.adminId,
    adminEmail: log.admin.email,
    adminRole: log.admin.role,
    beforeJson: log.beforeJson,
    afterJson: log.afterJson,
    metaJson: log.metaJson,
  }))

  return {
    total,
    page,
    pageSize,
    items,
  }
}
