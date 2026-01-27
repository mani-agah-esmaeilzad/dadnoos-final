import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { updateMonthlyQuota } from '@/lib/quota/monthly'

interface ListUsersParams {
  page: number
  pageSize: number
  query?: string
  status?: string
}

export async function listAdminUsers({ page, pageSize, query, status }: ListUsersParams) {
  const where: Prisma.UserWhereInput = {}
  if (query) {
    where['username'] = { contains: query, mode: 'insensitive' }
  }
  if (status) {
    where['status'] = status
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { quota: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const items = users.map((user) => ({
    id: user.id,
    username: user.username,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt,
    monthlyQuota: user.quota?.monthlyQuota ?? user.monthlyTokenQuota,
    monthlyUsed: user.quota?.monthlyUsed ?? user.monthlyTokenUsed,
    quotaResetAt: user.quota?.resetAt ?? null,
  }))

  return {
    total,
    page,
    pageSize,
    items,
  }
}

export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      quota: true,
    },
  })
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt,
    monthlyQuota: user.quota?.monthlyQuota ?? user.monthlyTokenQuota,
    monthlyUsed: user.quota?.monthlyUsed ?? user.monthlyTokenUsed,
    quotaResetAt: user.quota?.resetAt ?? null,
  }
}

export async function setUserMonthlyQuota(userId: string, monthlyQuota: number) {
  await updateMonthlyQuota(userId, monthlyQuota)
}

export async function setUserStatus(userId: string, status: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  })
}
