import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AdminRole } from '@prisma/client'

import { requireAdminAuth } from '@/lib/admin/auth'
import { getAdminUserDetail, setUserStatus } from '@/lib/admin/users'
import { buildAuditMeta, logAdminAction } from '@/lib/admin/audit'

const STATUS_VALUES = ['active', 'disabled'] as const

const bodySchema = z.object({
  status: z.enum(STATUS_VALUES),
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
    await setUserStatus(userId, body.status)
    const after = await getAdminUserDetail(userId)
    await logAdminAction({
      adminId: admin.id,
      actionType: 'UPDATE_USER_STATUS',
      entityType: 'user',
      entityId: userId,
      before,
      after,
      meta: buildAuditMeta(req, { status: body.status }),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
