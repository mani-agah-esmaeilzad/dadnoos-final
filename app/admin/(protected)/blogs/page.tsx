import { listBlogPosts } from '@/lib/admin/blogs'
import BlogManager from '@/app/admin/_components/blog-manager'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { withDbFallback } from '@/lib/db/fallback'

const PAGE_SIZE = 10

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0]
  return value
}

type StatusFilter = 'all' | 'published' | 'draft'

function parseStatus(value?: string | string[]): StatusFilter {
  const normalized = getParam(value)?.toLowerCase()
  if (normalized === 'published') return 'published'
  if (normalized === 'draft') return 'draft'
  return 'all'
}

export const metadata = {
  title: 'مدیریت بلاگ',
}

export default async function AdminBlogsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const pageParam = Number(getParam(resolvedSearchParams.page) ?? '1')
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const query = getParam(resolvedSearchParams.query) ?? ''
  const status = parseStatus(resolvedSearchParams.status)
  const publishedFilter = status === 'published' ? true : status === 'draft' ? false : undefined

  const fallbackData = {
    total: 0,
    page,
    pageSize: PAGE_SIZE,
    items: [],
  }
  const pageData = await withDbFallback(
    () =>
      listBlogPosts({
        page,
        pageSize: PAGE_SIZE,
        query: query || undefined,
        published: publishedFilter,
      }),
    fallbackData,
    'admin-blogs'
  )

  const serializablePosts = pageData.items.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }))

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm text-neutral-500">مدیریت محتوای عمومی</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">وبلاگ دادنوس</h1>
        <p className="text-sm text-neutral-500">
          پست‌های وبلاگ پس از انتشار در صفحه معرفی دادنوس و صفحه اختصاصی وبلاگ قابل مشاهده هستند.
        </p>
      </div>

      <form method="get" className="rounded-3xl border border-neutral-200/60 p-6 shadow-sm dark:border-neutral-800 space-y-4">
        <input type="hidden" name="page" value="1" />
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm text-neutral-500">جستجو</label>
            <Input name="query" placeholder="عنوان یا خلاصه" defaultValue={query} />
          </div>
          <div>
            <label className="text-sm text-neutral-500">وضعیت</label>
            <select
              name="status"
              defaultValue={status}
              className="mt-1 w-full rounded-3xl border border-neutral-400/50 bg-white/90 px-3 py-2 text-sm text-neutral-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
            >
              <option value="all">همه</option>
              <option value="published">منتشر شده</option>
              <option value="draft">پیش‌نویس</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="px-8">
            اعمال فیلتر
          </Button>
        </div>
      </form>

      <BlogManager
        posts={serializablePosts}
        pagination={{
          page: pageData.page,
          pageSize: pageData.pageSize,
          total: pageData.total,
        }}
        query={query}
        status={status}
      />
    </section>
  )
}
