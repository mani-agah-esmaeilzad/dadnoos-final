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
  { label: 'مصرف پیام', href: '/admin/usage' },
  { label: 'تخفیف‌ها', href: '/admin/discounts' },
  { label: 'وبلاگ', href: '/admin/blogs' },
  { label: 'پرامپت‌ها', href: '/admin/prompts' },
  { label: 'پشتیبانی', href: '/admin/support' },
  { label: 'ایده‌ها و نظرات', href: '/admin/feedback' },
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
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-black overflow-hidden overscroll-none">
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-30 w-80 flex flex-col transform border-0 md:border-l border-neutral-200/60 bg-white/80 p-6 backdrop-blur-xl transition-transform dark:border-neutral-800 dark:bg-neutral-900/70 pt-safe-10',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between py-2">
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">پنل مدیریت دادنوس</p>
          <Shield className="text-[#C8A175]" size={24} />
        </div>
        <nav className="mt-10 space-y-2 mb-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.comingSoon ? '#' : item.href}
                aria-disabled={item.comingSoon}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all hover:bg-neutral-400/15 active:bg-neutral-400/25',
                  active
                    ? 'bg-neutral-700 text-white dark:bg-neutral-800'
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

        <div className="mt-auto mb-2 space-y-2 rounded-3xl border border-neutral-400/50 dark:border-0 dark:bg-neutral-400/15 p-4 text-sm">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{admin?.email}</p>
          <p className="text-xs text-neutral-400">نقش: {admin?.role.toLowerCase()}</p>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="mt-4 w-full justify-center border-red-600 text-red-500 hover:bg-red-50 active:bg-red-100"
          >
            <LogOut size={16} />
            خروج
          </Button>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/45 dark:bg-black/75 transition-opacity duration-200 lg:hidden",
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "flex flex-1 flex-col pr-0 lg:pr-80 transition-transform overflow-y-auto overscroll-none no-scrollbar",
          sidebarOpen ? "-translate-x-80" : "translate-x-0",
        )}
      >
        <header className="sticky top-0 z-30 flex py-2 items-center justify-between border-b border-neutral-200/60 bg-white/70 px-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/60 pt-safe-10">
          <div className="lg:hidden">
            <Button className='grid gap-1.5 p-4 py-3.5 rounded-lg cursor-pointer' variant="ghost" size="icon" onClick={() => setSidebarOpen((prev) => !prev)}>
              <div className='bg-black dark:bg-white rounded-full h-0.5 w-4' />
              <div className='bg-black dark:bg-white rounded-full h-0.5 w-2' />
            </Button>
          </div>
          <div>
            <p className="text-sm text-neutral-500">خوش آمدید</p>
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{admin?.email}</p>
          </div>
          <div className="hidden items-center gap-3 text-sm text-neutral-500 lg:flex">
            <span className="rounded-full border border-neutral-200/70 px-3 py-1 text-xs uppercase tracking-widest text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              {admin?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 pt-8 pb-24 max-w-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
