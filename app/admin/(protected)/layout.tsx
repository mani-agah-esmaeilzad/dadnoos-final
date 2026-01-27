import { ReactNode } from 'react'

import AdminShell from '@/app/admin/_components/admin-shell'
import { requireAdminPage } from '@/lib/admin/server'

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage()
  return <AdminShell admin={admin}>{children}</AdminShell>
}
