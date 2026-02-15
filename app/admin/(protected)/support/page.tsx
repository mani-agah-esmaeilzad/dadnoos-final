import SupportInboxClient from '@/app/admin/_components/support-inbox'
import { listSupportConversations } from '@/lib/admin/support'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { withDbFallback } from '@/lib/db/fallback'

interface SupportPageProps {
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

export const metadata = {
  title: 'صندوق پشتیبانی',
}

export default async function AdminSupportPage({ searchParams }: SupportPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const pageParam = parseParam(resolvedSearchParams.page)
  const page = Math.max(Number(pageParam ?? '1'), 1)
  const query = parseParam(resolvedSearchParams.query) ?? ''
  const userId = parseParam(resolvedSearchParams.userId) ?? ''
  const flag = parseParam(resolvedSearchParams.flag) ?? 'any'
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
      listSupportConversations({
        page,
        pageSize: 20,
        query: query || undefined,
        userId: userId || undefined,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        flag: flag as 'any' | 'support' | 'reported',
      }),
    fallbackData,
    'admin-support'
  )

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-neutral-400">درخواست‌های پشتیبانی و گزارش‌ها</p>
        <h1 className="text-3xl font-semibold">صندوق پشتیبانی کاربران</h1>
      </div>

      <form className="grid gap-4 rounded-3xl border border-neutral-200/60 p-6 shadow-sm dark:border-neutral-800" method="get">
        <input type="hidden" name="page" value="1" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-sm text-neutral-500">جستجو</label>
            <Input name="query" placeholder="عنوان یا متن گفتگو" defaultValue={query} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">شناسه کاربر</label>
            <Input name="userId" placeholder="User ID" defaultValue={userId} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">وضعیت</label>
            <select
              name="flag"
              defaultValue={flag}
              className="mt-1 h-12 w-full appearance-none rounded-3xl border border-neutral-400/50 px-5 py-2 text-sm focus:outline-none"
            >
              <option value="any">مورد نیاز (پشتیبانی/گزارش)</option>
              <option value="support">فقط درخواست پشتیبانی</option>
              <option value="reported">فقط گزارش شده</option>
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

      <SupportInboxClient
        userIdFilter={userId || undefined}
        conversations={data.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          lastMessageAt: item.lastMessageAt.toISOString(),
        }))}
      />

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
                flag,
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
                flag,
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
