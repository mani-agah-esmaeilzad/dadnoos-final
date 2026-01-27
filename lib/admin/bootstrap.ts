import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'
import { hashPassword } from '@/lib/auth/password'
import { AdminRole } from '@prisma/client'

let bootstrapAttempted = false

export async function ensureBootstrapAdmin() {
  if (bootstrapAttempted) return
  bootstrapAttempted = true
  if (!env.ADMIN_BOOTSTRAP_EMAIL || !env.ADMIN_BOOTSTRAP_PASSWORD) {
    return
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: env.ADMIN_BOOTSTRAP_EMAIL },
  })
  if (existing) {
    return
  }

  const passwordHash = await hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD)
  await prisma.adminUser.create({
    data: {
      email: env.ADMIN_BOOTSTRAP_EMAIL,
      passwordHash,
      role: AdminRole.SUPERADMIN,
      status: 'active',
    },
  })
  console.info('Bootstrap admin user created at', env.ADMIN_BOOTSTRAP_EMAIL)
}
