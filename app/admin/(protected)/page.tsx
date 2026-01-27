import DashboardCharts from '@/app/admin/_components/dashboard-charts'
import { KpiCard } from '@/app/admin/_components/kpi-card'
import { Button } from '@/app/_ui/components/button'
import { getDashboardOverview } from '@/lib/admin/dashboard'

interface DashboardProps {
  searchParams?: Record<string, string | string[] | undefined>
}

function parseRange(value?: string | string[]) {
  if (typeof value !== 'string') return undefined
  return value === '30d' ? '30d' : '7d'
}

function formatNumber(value: number) {
  return Intl.NumberFormat('fa-IR').format(value)
}

export const metadata = {
  title: 'داشبورد مدیریت',
}

export default async function AdminDashboardPage({ searchParams }: DashboardProps) {
  const range = parseRange(searchParams?.range)
  const overview = await getDashboardOverview({ range })
  const last30Label = formatNumber(overview.metrics.tokens.last30Days)

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-neutral-500">بررسی اجمالی</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">داشبورد مدیریت</h1>
          <form className="flex items-center gap-3 rounded-3xl border border-neutral-200/60 px-4 py-2 text-sm dark:border-neutral-800" method="get">
            <label className="text-neutral-500" htmlFor="range-select">
              بازه:
            </label>
            <select
              id="range-select"
              name="range"
              defaultValue={overview.range.label}
              className="rounded-2xl border border-neutral-300/60 px-3 py-1 text-sm text-neutral-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-200"
            >
              <option value="7d">۷ روز گذشته</option>
              <option value="30d">۳۰ روز گذشته</option>
            </select>
            <Button type="submit" size="sm" className="rounded-2xl px-4">
              بروزرسانی
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="کل کاربران ثبت شده" value={overview.metrics.users} description="کاربران تایید شده در سیستم" />
        <KpiCard label="تعداد گفتگوها" value={overview.metrics.conversations} description="مجموع جلسات ایجاد شده" />
        <KpiCard label="پیام‌های مبادله‌شده" value={overview.metrics.messages} description="کل پیام‌ها" />
        <KpiCard
          label={`مصرف توکن (${overview.range.label === '7d' ? '۷ روز' : '۳۰ روز'})`}
          value={overview.metrics.tokens.rangeTotal}
          description={`۳۰ روز اخیر: ${last30Label}`}
        />
      </div>

      <DashboardCharts
        tokensPerDay={overview.charts.tokensPerDay}
        messagesPerDay={overview.charts.messagesPerDay}
        topUsers={overview.charts.topUsers}
        moduleDistribution={overview.charts.moduleDistribution}
      />
    </section>
  )
}
