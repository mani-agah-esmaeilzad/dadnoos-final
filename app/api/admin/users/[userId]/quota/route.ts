import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AdminRole } from '@prisma/client'

import { requireAdminAuth } from '@/lib/admin/auth'
import { getAdminUserDetail, setUserMonthlyQuota } from '@/lib/admin/users'
import { buildAuditMeta, logAdminAction } from '@/lib/admin/audit'

const bodySchema = z.object({
  monthlyQuota: z.coerce.number().int().nonnegative(),
})

export async function PATCH(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const admin = await requireAdminAuth(req, [AdminRole.ADMIN, AdminRole.SUPERADMIN])
    const { userId } = await context.params
    const body = bodySchema.parse(await req.json())
    const before = await getAdminUserDetail(userId)
    if (!before) {
      return NextResponse.json({ detail: 'کاربر یافت نشد.' }, { status: 404 })
    }
    await setUserMonthlyQuota(userId, body.monthlyQuota)
    const after = await getAdminUserDetail(userId)
    await logAdminAction({
      adminId: admin.id,
      actionType: 'UPDATE_USER_QUOTA',
      entityType: 'user',
      entityId: userId,
      before,
      after,
      meta: buildAuditMeta(req, { monthlyQuota: body.monthlyQuota }),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
