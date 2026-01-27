import { AdminRole } from '@prisma/client'

export const ADMIN_ROLE_ORDER: Record<AdminRole, number> = {
  SUPERADMIN: 3,
  ADMIN: 2,
  ANALYST: 1,
}

export function hasRequiredRole(current: AdminRole, allowed: AdminRole[]) {
  if (!allowed.length) return true
  const currentRank = ADMIN_ROLE_ORDER[current] ?? 0
  return allowed.some((role) => currentRank >= (ADMIN_ROLE_ORDER[role] ?? 0))
}
