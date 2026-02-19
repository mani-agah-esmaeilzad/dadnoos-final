'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { normalizeSlug } from '@/lib/blog/slug'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { Textarea } from '@/app/_ui/components/textarea'
import { toPersianNumber } from '@/app/_lib/utils'
import { useNotifContext } from '@/app/_ui/notif'

type BlogPostRow = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  authorEmail: string | null
}

type StatusFilter = 'all' | 'published' | 'draft'

interface BlogManagerProps {
  posts: BlogPostRow[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  query: string
  status: StatusFilter
}

interface BlogFormState {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl: string
  published: boolean
}

const emptyFormState: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  published: false,
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function truncate(value: string | null | undefined, length = 90) {
  if (!value) return ''
  if (value.length <= length) return value
  return `${value.slice(0, length).trim()}…`
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    search.set(key, String(value))
  }
  return search.toString()
}

export default function BlogManager({ posts, pagination, query, status }: BlogManagerProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPostRow | null>(null)
  const [formData, setFormData] = useState<BlogFormState>(emptyFormState)
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null)
  const [deletePending, setDeletePending] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const {showConfirm} = useNotifContext()

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize))

  const openCreateForm = () => {
    setSelectedPost(null)
    setFormData(emptyFormState)
    setSlugTouched(false)
    setError(null)
    setFormOpen(true)
  }

  const openEditForm = (post: BlogPostRow) => {
    setSelectedPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? '',
      published: post.published,
    })
    setSlugTouched(true)
    setError(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setSelectedPost(null)
    setFormData(emptyFormState)
    setError(null)
  }

  const updateFormField = (field: keyof BlogFormState, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTitleChange = (value: string) => {
    updateFormField('title', value)
    if (!slugTouched) {
      updateFormField('slug', normalizeSlug(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlugTouched(true)
    updateFormField('slug', normalizeSlug(value))
  }

  const submitForm = () => {
    const payload = {
      ...formData,
      slug: normalizeSlug(formData.slug || formData.title),
    }
    if (!payload.title.trim()) {
      setError('عنوان نمی‌تواند خالی باشد.')
      return
    }
    if (!payload.slug) {
      setError('لطفاً اسلاگ معتبری انتخاب کنید.')
      return
    }
    if (!payload.content.trim()) {
      setError('متن مقاله نمی‌تواند خالی باشد.')
      return
    }

    startTransition(async () => {
      setError(null)
      setActionMessage(null)
      const endpoint = selectedPost ? `/api/admin/blogs/${selectedPost.id}` : '/api/admin/blogs'
      const method = selectedPost ? 'PATCH' : 'POST'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}))
        setError(detail.detail || 'ذخیره‌سازی با خطا مواجه شد.')
        return
      }
      setActionMessage({
        text: selectedPost ? 'مقاله بروزرسانی شد.' : 'مقاله جدید ثبت شد.',
        tone: 'success',
      })
      setTimeout(() => setActionMessage(null), 4000)
      closeForm()
      router.refresh()
    })
  }

  const handleDelete = async (post: BlogPostRow) => {
    const ok = await showConfirm(
      `آیا از حذف مقاله «${post.title}» مطمئن هستید؟`
    );
    if (!ok) return
    setDeletePending(post.id)
    fetch(`/api/admin/blogs/${post.id}`, { method: 'DELETE' })
      .then(async (response) => {
        if (!response.ok) {
          const detail = await response.json().catch(() => ({}))
          throw new Error(detail.detail || 'خطا در حذف پست.')
        }
        router.refresh()
      })
      .catch((err) => {
        setActionMessage({ text: err.message, tone: 'error' })
        setTimeout(() => setActionMessage(null), 4000)
      })
      .finally(() => setDeletePending(null))
  }

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${actionMessage.tone === 'success'
            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200'
            : 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}
        >
          {actionMessage.text}
        </div>
      )}
      <div className="rounded-3xl border border-neutral-200/60 bg-white/90 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/60 ps-6 p-4 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-semibold">پست‌های وبلاگ</h2>
            <p className="text-sm text-neutral-400 pt-1">
              {toPersianNumber(pagination.total)} پست ثبت‌شده
            </p>
          </div>
          <Button className='rounded-full' variant="secondary" onClick={openCreateForm}>پست جدید</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] divide-y divide-neutral-400/25 text-sm">
            <thead className="bg-neutral-50/80 text-neutral-500 dark:bg-neutral-900/50">
              <tr>
                <th className="px-5 py-3 text-right font-medium whitespace-nowrap">عنوان</th>
                <th className="px-5 py-3 text-right font-medium whitespace-nowrap">وضعیت</th>
                <th className="px-5 py-3 text-right font-medium whitespace-nowrap">آخرین بروزرسانی</th>
                <th className="px-5 py-3 text-right font-medium whitespace-nowrap">نویسنده</th>
                <th className="px-5 py-3 text-right font-medium whitespace-nowrap">اقدامات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white/60 dark:divide-neutral-800 dark:bg-neutral-900/20">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{post.title}</div>
                    <div className="text-xs text-neutral-500">/{post.slug}</div>
                    <p className="mt-1 text-xs text-neutral-500">{truncate(post.excerpt ?? post.content)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${post.published
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                        }`}
                    >
                      {post.published ? 'منتشر شده' : 'پیش‌نویس'}
                    </span>
                    <div className="mt-1 text-xs text-neutral-500 whitespace-nowrap">
                      {post.published ? formatDate(post.publishedAt) : 'منتشر نشده'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-700 dark:text-neutral-200 whitespace-nowrap">{formatDate(post.updatedAt)}</td>
                  <td className="px-5 py-4 text-sm text-neutral-600 whitespace-nowrap">
                    {post.authorEmail ?? '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="grid gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEditForm(post)}>
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletePending === post.id}
                        onClick={() => handleDelete(post)}
                      >
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!posts.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-neutral-500">
                    هنوز پستی ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/60 px-6 py-4 text-sm dark:border-neutral-800">
          <span>
            صفحه {pagination.page} از {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              disabled={pagination.page <= 1}
              className="border border-neutral-400/25 px-4 py-1 disabled:cursor-not-allowed"
            >
              <a
                href={`?${buildQueryString({
                  page: pagination.page - 1,
                  query: query || undefined,
                  status: status === 'all' ? undefined : status,
                })}`}
              >
                قبلی
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              disabled={pagination.page >= totalPages}
              className="border border-neutral-400/25 px-4 py-1 disabled:cursor-not-allowed"
            >
              <a
                href={`?${buildQueryString({
                  page: pagination.page + 1,
                  query: query || undefined,
                  status: status === 'all' ? undefined : status,
                })}`}
              >
                بعدی
              </a>
            </Button>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="rounded-3xl border border-neutral-300/25 bg-white/95 p-6 shadow-sm dark:bg-neutral-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {selectedPost ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}
              </h3>
              <p className="text-sm text-neutral-500">در صورت انتشار، مقاله بلافاصله در سایت نمایش داده می‌شود.</p>
            </div>
            <Button className='hidden md:block' variant="ghost" onClick={closeForm}>
              بستن
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm text-neutral-500">عنوان</label>
              <Input value={formData.title} onChange={(event) => handleTitleChange(event.target.value)} placeholder="عنوان مقاله" />
            </div>
            <div>
              <label className="text-sm text-neutral-500">اسلاگ</label>
              <Input value={formData.slug} onChange={(event) => handleSlugChange(event.target.value)} placeholder="slug-example" />
            </div>
            <div>
              <label className="text-sm text-neutral-500">آدرس تصویر کاور (اختیاری)</label>
              <Input
                type="url"
                value={formData.coverImageUrl}
                onChange={(event) => updateFormField('coverImageUrl', event.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-neutral-500">خلاصه کوتاه</label>
              <Textarea
                rows={3}
                value={formData.excerpt}
                onChange={(event) => updateFormField('excerpt', event.target.value)}
                placeholder="چکیده‌ای کوتاه از محتوا (اختیاری)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-neutral-500">محتوا (Markdown پشتیبانی می‌شود)</label>
              <Textarea
                rows={12}
                className="font-mono"
                value={formData.content}
                onChange={(event) => updateFormField('content', event.target.value)}
                placeholder="متن کامل مقاله را در اینجا بنویسید..."
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 rounded-3xl border border-neutral-400/50 p-3 text-sm">
              <input
                id="published-checkbox"
                type="checkbox"
                className="appearance-none size-5 border cursor-pointer border-neutral-400 rounded-md bg-transparent checked:bg-emerald-700 checked:border-emerald-700 checked:after:content-['✓'] checked:after:text-white checked:after:block checked:after:text-center checked:after:leading-5 transition-all"
                checked={formData.published}
                onChange={(event) => updateFormField('published', event.target.checked)}
              />
              <label htmlFor="published-checkbox" className="cursor-pointer select-none">
                انتشار فوری در وب‌سایت
              </label>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <div className="mt-6 flex flex-wrap justify-start gap-3">
            <Button className='px-10' variant="outline" onClick={closeForm}>
              لغو
            </Button>
            <Button onClick={submitForm} disabled={isPending}>
              {selectedPost ? 'ذخیره تغییرات' : 'ایجاد مقاله'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
