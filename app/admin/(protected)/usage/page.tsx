import { getUsageBreakdown, getTopUsageUsers } from '@/lib/admin/usage'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { withDbFallback } from '@/lib/db/fallback'

interface UsagePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function parseParam(value?: string | string[]) {
  return typeof value === 'string' ? value : undefined
}

function formatNumber(value: number) {
  return value.toLocaleString('fa-IR')
}

function UsageTable({
  title,
  rows,
}: {
  title: string
  rows: { key: string; totalTokens: number; promptTokens: number; completionTokens: number }[]
}) {
  return (
    <div className="space-y-3 rounded-3xl border border-neutral-200/60 p-6 shadow-sm dark:border-neutral-800">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-neutral-200/60 text-sm">
          <thead className="bg-neutral-50/60 text-neutral-500 dark:bg-neutral-900/40">
            <tr>
              <th className="px-4 py-3 text-right font-medium">گروه</th>
              <th className="px-4 py-3 text-right font-medium">توکن کل</th>
              <th className="px-4 py-3 text-right font-medium">پرامپت</th>
              <th className="px-4 py-3 text-right font-medium">پاسخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/60 dark:divide-neutral-800/80">
            {rows.map((row) => (
              <tr key={row.key} className="bg-white/60 dark:bg-neutral-900/30">
                <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-100">{row.key}</td>
                <td className="px-4 py-3">{formatNumber(row.totalTokens)}</td>
                <td className="px-4 py-3">{formatNumber(row.promptTokens)}</td>
                <td className="px-4 py-3">{formatNumber(row.completionTokens)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-neutral-500">
                  داده‌ای برای نمایش وجود ندارد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function AdminUsagePage({ searchParams }: UsagePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const fromParam = parseParam(resolvedSearchParams.from)
  const toParam = parseParam(resolvedSearchParams.to)
  const now = new Date()
  const defaultFrom = new Date(now)
  defaultFrom.setDate(now.getDate() - 7)
  const fromDate = fromParam ? new Date(fromParam) : defaultFrom
  const toDate = toParam ? new Date(toParam) : now

  const [daily, byModel, byModule, topUsers] = await Promise.all([
    withDbFallback(
      () => getUsageBreakdown({ from: fromDate, to: toDate, groupBy: 'day' }),
      [],
      'admin-usage-daily'
    ),
    withDbFallback(
      () => getUsageBreakdown({ from: fromDate, to: toDate, groupBy: 'model' }),
      [],
      'admin-usage-model'
    ),
    withDbFallback(
      () => getUsageBreakdown({ from: fromDate, to: toDate, groupBy: 'module' }),
      [],
      'admin-usage-module'
    ),
    withDbFallback(
      () => getTopUsageUsers({ from: fromDate, to: toDate, limit: 5 }),
      [],
      'admin-usage-top-users'
    ),
  ])

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-neutral-500">پایش مصرف</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">گزارش مصرف توکن</h1>
      </div>

      <form className="grid gap-4 rounded-3xl border border-neutral-200/60 p-6 text-sm shadow-sm dark:border-neutral-800" method="get">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-neutral-500">از تاریخ</label>
            <Input type="date" name="from" defaultValue={fromDate.toISOString().slice(0, 10)} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">تا تاریخ</label>
            <Input type="date" name="to" defaultValue={toDate.toISOString().slice(0, 10)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="px-8">
            بروزرسانی
          </Button>
        </div>
      </form>

      <UsageTable title="مصرف بر اساس روز" rows={daily} />
      <UsageTable title="مصرف بر اساس مدل" rows={byModel} />
      <UsageTable title="مصرف بر اساس ماژول" rows={byModule} />

      <div className="space-y-3 rounded-3xl border border-neutral-200/60 p-6 shadow-sm dark:border-neutral-800">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">برترین کاربران</h3>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-neutral-200/60 text-sm">
            <thead className="bg-neutral-50/60 text-neutral-500 dark:bg-neutral-900/40">
              <tr>
                <th className="px-4 py-3 text-right font-medium">کاربر</th>
                <th className="px-4 py-3 text-right font-medium">توکن کل</th>
                <th className="px-4 py-3 text-right font-medium">پرامپت</th>
                <th className="px-4 py-3 text-right font-medium">پاسخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100/60 dark:divide-neutral-800/80">
              {topUsers.map((user) => (
                <tr key={user.userId} className="bg-white/60 dark:bg-neutral-900/30">
                  <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-100">{user.username}</td>
                  <td className="px-4 py-3">{formatNumber(user.totalTokens)}</td>
                  <td className="px-4 py-3">{formatNumber(user.promptTokens)}</td>
                  <td className="px-4 py-3">{formatNumber(user.completionTokens)}</td>
                </tr>
              ))}
              {!topUsers.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-neutral-500">
                    داده‌ای ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
