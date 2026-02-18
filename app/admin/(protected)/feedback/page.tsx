import { listFeedback } from '@/lib/admin/feedback'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { withDbFallback } from '@/lib/db/fallback'

interface FeedbackPageProps {
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

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  NEW: { label: 'جدید', className: 'bg-amber-100 text-amber-700' },
  REVIEWED: { label: 'بررسی شد', className: 'bg-sky-100 text-sky-700' },
  RESOLVED: { label: 'بسته شد', className: 'bg-emerald-100 text-emerald-700' },
}

const TYPE_LABELS: Record<string, string> = {
  IDEA: 'ایده / نظر',
  REPORT: 'گزارش مشکل',
}

export const metadata = {
  title: 'ایده‌ها و نظرات کاربران',
}

export default async function AdminFeedbackPage({ searchParams }: FeedbackPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const pageParam = parseParam(resolvedSearchParams.page)
  const page = Math.max(Number(pageParam ?? '1'), 1)
  const query = parseParam(resolvedSearchParams.query) ?? ''
  const userId = parseParam(resolvedSearchParams.userId) ?? ''
  const status = parseParam(resolvedSearchParams.status) ?? ''
  const type = parseParam(resolvedSearchParams.type) ?? ''
  const from = parseParam(resolvedSearchParams.from) ?? ''
  const to = parseParam(resolvedSearchParams.to) ?? ''

  const fallbackData = {
    total: 0,
    page,
    pageSize: 20,
    items: [],
  }

  const data = await withDbFallback(
    () =>
      listFeedback({
        page,
        pageSize: 20,
        query: query || undefined,
        userId: userId || undefined,
        status: status ? (status as 'NEW' | 'REVIEWED' | 'RESOLVED') : undefined,
        type: type ? (type as 'IDEA' | 'REPORT') : undefined,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      }),
    fallbackData,
    'admin-feedback'
  )

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-neutral-400">بازخوردها و گزارش‌های کاربران</p>
        <h1 className="text-3xl font-semibold">ثبت ایده‌ها و نظرات</h1>
      </div>

      <form className="grid gap-4 rounded-3xl border border-neutral-200/60 p-6 shadow-sm dark:border-neutral-800" method="get">
        <input type="hidden" name="page" value="1" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-sm text-neutral-500">جستجو</label>
            <Input name="query" placeholder="عنوان یا متن" defaultValue={query} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">شناسه کاربر</label>
            <Input name="userId" placeholder="User ID" defaultValue={userId} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">نوع پیام</label>
            <select
              name="type"
              defaultValue={type}
              className="mt-1 h-12 w-full appearance-none rounded-3xl border border-neutral-400/50 px-5 py-2 text-sm focus:outline-none"
            >
              <option value="">همه</option>
              <option value="IDEA">ایده / نظر</option>
              <option value="REPORT">گزارش مشکل</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-500">وضعیت</label>
            <select
              name="status"
              defaultValue={status}
              className="mt-1 h-12 w-full appearance-none rounded-3xl border border-neutral-400/50 px-5 py-2 text-sm focus:outline-none"
            >
              <option value="">همه</option>
              <option value="NEW">جدید</option>
              <option value="REVIEWED">بررسی شد</option>
              <option value="RESOLVED">بسته شد</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-500">از تاریخ</label>
            <Input className='h-12 appearance-none' type="date" name="from" defaultValue={from} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">تا تاریخ</label>
            <Input className='h-12 appearance-none' type="date" name="to" defaultValue={to} />
          </div>
        </div>
        <div className="flex justify-start">
          <Button type="submit" className="px-8 rounded-full">
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
              <th className="px-4 py-3 text-right font-medium">وضعیت</th>
              <th className="px-4 py-3 text-right font-medium">کاربر</th>
              <th className="px-4 py-3 text-right font-medium">عنوان</th>
              <th className="px-4 py-3 text-right font-medium">پیام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/60 bg-white/80 dark:divide-neutral-800/80 dark:bg-neutral-900/40">
            {data.items.map((item) => {
              const statusInfo = STATUS_LABELS[item.status] ?? STATUS_LABELS.NEW
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-neutral-800 dark:text-neutral-100">{item.username || '—'}</div>
                    <div className="text-xs text-neutral-500">{item.userId || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-800 dark:text-neutral-100">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    <p className="max-w-xs line-clamp-3">
                      {item.message}
                    </p>
                  </td>
                </tr>
              )
            })}
            {!data.items.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-neutral-500">
                  بازخوردی ثبت نشده است.
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
            className="border border-neutral-400/25 px-4 py-1 disabled:cursor-not-allowed"
          >
            <a
              href={`?${buildQueryString({
                page: page - 1,
                query: query || undefined,
                userId: userId || undefined,
                status: status || undefined,
                type: type || undefined,
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
            className="border border-neutral-400/25 px-4 py-1 disabled:cursor-not-allowed"
          >
            <a
              href={`?${buildQueryString({
                page: page + 1,
                query: query || undefined,
                userId: userId || undefined,
                status: status || undefined,
                type: type || undefined,
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
