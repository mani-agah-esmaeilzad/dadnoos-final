import Link from 'next/link'

import { listAdminUsers } from '@/lib/admin/users'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import UserActions from '@/app/admin/_components/user-actions'

interface UsersPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

const PAGE_SIZE = 20

function parseParam(value?: string | string[]) {
  return typeof value === 'string' ? value : undefined
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    searchParams.set(key, String(value))
  }
  return searchParams.toString()
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const pageParam = parseParam(searchParams?.page)
  const query = parseParam(searchParams?.query) ?? ''
  const status = parseParam(searchParams?.status) ?? 'all'
  const page = Math.max(Number(pageParam ?? '1'), 1)

  const data = await listAdminUsers({
    page,
    pageSize: PAGE_SIZE,
    query: query || undefined,
    status: status === 'all' ? undefined : status,
  })
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-neutral-500">مدیریت کاربران</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">کاربران و سهمیه‌ها</h1>
      </div>

      <form className="grid gap-4 rounded-3xl border border-neutral-200/60 p-6 shadow-sm dark:border-neutral-800" method="get">
        <input type="hidden" name="page" value="1" />
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="text-sm text-neutral-500">جستجوی کاربر</label>
            <Input name="query" placeholder="نام کاربری" defaultValue={query} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">وضعیت</label>
            <select
              name="status"
              defaultValue={status}
              className="mt-1 w-full rounded-3xl border border-neutral-300/60 px-3 py-2 text-sm focus:outline-none"
            >
              <option value="all">همه</option>
              <option value="active">فعال</option>
              <option value="disabled">غیرفعال</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="px-8">
            اعمال فیلتر
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/70 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/40">
        <table className="w-full min-w-full divide-y divide-neutral-200/60 text-sm">
          <thead className="bg-neutral-50/60 text-neutral-500 dark:bg-neutral-900/60">
            <tr>
              <th className="px-4 py-3 text-right font-medium">کاربر</th>
              <th className="px-4 py-3 text-right font-medium">وضعیت</th>
              <th className="px-4 py-3 text-right font-medium">مصرف ماه</th>
              <th className="px-4 py-3 text-right font-medium">ریست بعدی</th>
              <th className="px-4 py-3 text-right font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/60 dark:divide-neutral-800/80">
            {data.items.map((user) => (
              <tr key={user.id} className="bg-white/70 hover:bg-neutral-50/80 dark:bg-neutral-900/30">
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{user.username}</span>
                    <span className="text-xs text-neutral-500">ساخته شده: {new Date(user.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-neutral-700 dark:text-neutral-200">
                    {user.monthlyUsed.toLocaleString('fa-IR')} / {user.monthlyQuota.toLocaleString('fa-IR')}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-neutral-500">
                  {user.quotaResetAt ? new Date(user.quotaResetAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                </td>
                <td className="px-4 py-4">
                  <UserActions userId={user.id} status={user.status} monthlyQuota={user.monthlyQuota} />
                </td>
              </tr>
            ))}
            {!data.items.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  کاربری یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-3xl border border-neutral-200/60 px-4 py-3 text-sm dark:border-neutral-800">
        <span>
          صفحه {page} از {totalPages}
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            asChild
            className="border border-neutral-200/60 px-4 py-1 disabled:cursor-not-allowed"
          >
            <Link
              href={`?${buildQueryString({
                page: page - 1,
                query: query || undefined,
                status: status !== 'all' ? status : undefined,
              })}`}
            >
              قبلی
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            asChild
            className="border border-neutral-200/60 px-4 py-1 disabled:cursor-not-allowed"
          >
            <Link
              href={`?${buildQueryString({
                page: page + 1,
                query: query || undefined,
                status: status !== 'all' ? status : undefined,
              })}`}
            >
              بعدی
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
