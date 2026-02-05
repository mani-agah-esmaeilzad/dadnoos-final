import { listTrackingEvents } from '@/lib/admin/events'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { withDbFallback } from '@/lib/db/fallback'

interface EventsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatPayload(payload: unknown) {
  if (!payload) return '—'
  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return '—'
  }
}

export const metadata = {
  title: 'رویدادهای سیستمی',
}

export default async function AdminEventsPage({ searchParams }: EventsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const pageParam = parseParam(resolvedSearchParams.page)
  const page = Math.max(Number(pageParam ?? '1'), 1)
  const eventType = parseParam(resolvedSearchParams.eventType) ?? ''
  const userId = parseParam(resolvedSearchParams.userId) ?? ''
  const from = parseParam(resolvedSearchParams.from) ?? ''
  const to = parseParam(resolvedSearchParams.to) ?? ''

  const fallbackData = {
    total: 0,
    page,
    pageSize: 25,
    items: [],
  }
  const data = await withDbFallback(
    () =>
      listTrackingEvents({
        page,
        pageSize: 25,
        eventType: eventType || undefined,
        userId: userId || undefined,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      }),
    fallbackData,
    'admin-events'
  )

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-neutral-500">رویدادهای عملیاتی</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">مانیتورینگ سیستم</h1>
      </div>

      <form className="grid gap-4 rounded-3xl border border-neutral-200/60 p-6 shadow-sm dark:border-neutral-800" method="get">
        <input type="hidden" name="page" value="1" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm text-neutral-500">نوع رویداد</label>
            <Input name="eventType" placeholder="chat_request" defaultValue={eventType} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">شناسه کاربر</label>
            <Input name="userId" placeholder="user id" defaultValue={userId} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">از تاریخ</label>
            <Input type="date" name="from" defaultValue={from} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">تا تاریخ</label>
            <Input type="date" name="to" defaultValue={to} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="px-8">
            اعمال فیلتر
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-neutral-200/60 shadow-sm dark:border-neutral-800">
        <table className="w-full min-w-full divide-y divide-neutral-200/60 text-sm">
          <thead className="bg-neutral-50/60 text-neutral-500 dark:bg-neutral-900/40">
            <tr>
              <th className="px-4 py-3 text-right font-medium">زمان</th>
              <th className="px-4 py-3 text-right font-medium">نوع</th>
              <th className="px-4 py-3 text-right font-medium">کاربر</th>
              <th className="px-4 py-3 text-right font-medium">منبع</th>
              <th className="px-4 py-3 text-right font-medium">جزئیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/60 bg-white/80 dark:divide-neutral-800/80 dark:bg-neutral-900/40">
            {data.items.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{formatDateTime(event.createdAt)}</td>
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">{event.eventType}</td>
                <td className="px-4 py-3">
                  <div className="text-neutral-800 dark:text-neutral-100">{event.username || '—'}</div>
                  <div className="text-xs text-neutral-500">{event.userId || '—'}</div>
                </td>
                <td className="px-4 py-3 text-neutral-600">{event.source || '—'}</td>
                <td className="px-4 py-3">
                  <pre className="max-h-40 overflow-y-auto rounded-2xl bg-neutral-50/80 p-3 text-xs text-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-200">
                    {formatPayload(event.payload)}
                  </pre>
                </td>
              </tr>
            ))}
            {!data.items.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-neutral-500">
                  رویداد ثبت نشده است.
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
            <a
              href={`?${buildQueryString({
                page: page - 1,
                eventType: eventType || undefined,
                userId: userId || undefined,
                from: from || undefined,
                to: to || undefined,
              })}`}
            >
              قبلی
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            asChild
            className="border border-neutral-200/60 px-4 py-1 disabled:cursor-not-allowed"
          >
            <a
              href={`?${buildQueryString({
                page: page + 1,
                eventType: eventType || undefined,
                userId: userId || undefined,
                from: from || undefined,
                to: to || undefined,
              })}`}
            >
              بعدی
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
