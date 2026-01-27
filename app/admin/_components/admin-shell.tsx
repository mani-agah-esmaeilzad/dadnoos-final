'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Menu, Shield } from 'lucide-react'

import { Button } from '@/app/_ui/components/button'
import { cn } from '@/app/_lib/utils'
import type { AdminRole } from '@prisma/client'

interface AdminShellProps {
  admin: { email: string; role: AdminRole }
  children: ReactNode
}

interface NavItem {
  label: string
  href: string
  comingSoon?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'داشبورد', href: '/admin' },
  { label: 'کاربران', href: '/admin/users' },
  { label: 'مصرف توکن', href: '/admin/usage' },
  { label: 'وبلاگ', href: '/admin/blogs' },
  { label: 'پرامپت‌ها', href: '/admin/prompts' },
  { label: 'پشتیبانی', href: '/admin/support' },
  { label: 'رویدادها', href: '/admin/events' },
  { label: 'گزارش بازرسی', href: '/admin/audit-logs' },
]

export default function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-black">
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-30 w-72 transform border-l border-neutral-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-transform dark:border-neutral-800 dark:bg-neutral-900/70',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">پنل مدیریت</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Dadnoos</p>
          </div>
          <Shield className="text-[#C8A175]" size={24} />
        </div>
        <nav className="mt-10 space-y-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.comingSoon ? '#' : item.href}
                aria-disabled={item.comingSoon}
                className={cn(
                  'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  active
                    ? 'bg-neutral-900 text-white shadow-lg dark:bg-neutral-800'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60',
                  item.comingSoon && 'cursor-not-allowed opacity-60'
                )}
              >
                <span>{item.label}</span>
                {item.comingSoon ? (
                  <span className="text-xs text-neutral-400">به زودی</span>
                ) : active ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : null}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto space-y-2 rounded-2xl border border-neutral-200/70 p-4 text-sm dark:border-neutral-800">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{admin.email}</p>
          <p className="text-xs text-neutral-500">نقش: {admin.role.toLowerCase()}</p>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="mt-3 w-full justify-center border border-neutral-200/70 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300"
          >
            <LogOut size={16} />
            خروج
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col pr-0 lg:pr-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200/60 bg-white/70 px-6 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen((prev) => !prev)}>
              <Menu />
            </Button>
          </div>
          <div>
            <p className="text-sm text-neutral-500">خوش آمدید</p>
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{admin.email}</p>
          </div>
          <div className="hidden items-center gap-3 text-sm text-neutral-500 lg:flex">
            <span className="rounded-full border border-neutral-200/70 px-3 py-1 text-xs uppercase tracking-widest text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              {admin.role}
            </span>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
