import { NextRequest } from 'next/server'
import { AdminRole } from '@prisma/client'

import { HttpError } from '@/lib/http/errors'
import { getAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/admin/session'
import { hasRequiredRole } from '@/lib/admin/rbac'

export async function requireAdminAuth(req: NextRequest, allowedRoles: AdminRole[] = []) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const session = await getAdminSession(token)
  if (!session) {
    throw new HttpError(401, 'Admin authentication required')
  }
  if (allowedRoles.length && !hasRequiredRole(session.admin.role, allowedRoles)) {
    throw new HttpError(403, 'Insufficient admin role')
  }
  return session.admin
}
