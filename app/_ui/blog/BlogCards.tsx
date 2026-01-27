import Link from 'next/link'

import type { BlogPostPreview } from '@/lib/blog/posts'
import { cn } from '@/app/_lib/utils'

interface BlogCardsProps {
  posts: BlogPostPreview[]
  className?: string
}

function formatDate(value: Date | string | null) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
  }).format(date)
}

export default function BlogCards({ posts, className }: BlogCardsProps) {
  if (!posts.length) {
    return (
      <div className={cn('rounded-3xl border border-dashed border-neutral-200/70 p-10 text-center text-sm text-neutral-500 dark:border-neutral-800', className)}>
        هنوز محتوایی برای نمایش وجود ندارد.
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6 md:grid-cols-2 xl:grid-cols-3', className)}>
      {posts.map((post) => (
        <article key={post.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/95 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          {post.coverImageUrl && (
            <div
              className="h-48 w-full bg-neutral-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${post.coverImageUrl})` }}
              aria-hidden="true"
            />
          )}
          <div className="flex h-full flex-col gap-3 p-5">
            <div className="text-xs text-neutral-500">{formatDate(post.publishedAt)}</div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{post.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{post.excerpt}</p>
            <div className="mt-auto flex items-center justify-between pt-3 text-sm">
              <span className="text-neutral-500">مطالعه حدوداً ۵ دقیقه</span>
              <Link href={`/blog/${post.slug}`} className="font-semibold text-[#9b956d] hover:opacity-80">
                مطالعه کامل
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
