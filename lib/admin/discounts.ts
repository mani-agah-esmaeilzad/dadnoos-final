import { prisma } from '@/lib/db/prisma'

export async function listDiscountCodes() {
  const discounts = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { redemptions: true } },
    },
  })

  return discounts.map((discount) => ({
    id: discount.id,
    code: discount.code,
    description: discount.description,
    percentage: discount.percentage,
    max_redemptions: discount.maxRedemptions,
    redemptions_count: discount._count.redemptions,
    expires_at: discount.expiresAt?.toISOString() ?? null,
    is_active: discount.isActive,
    created_at: discount.createdAt.toISOString(),
    updated_at: discount.updatedAt.toISOString(),
  }))
}
