import Link from 'next/link'

import type { BlogPostPreview } from '@/lib/blog/posts'
import BlogCards from '@/app/_ui/blog/BlogCards'

interface BlogSectionProps {
  posts: BlogPostPreview[]
}

export default function BlogSection({ posts }: BlogSectionProps) {
  const latest = posts.slice(0, 3)

  return (
    <section id="blog" className="mx-auto mt-10 max-w-6xl space-y-6 rounded-3xl border border-neutral-200/70 bg-white/90 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 md:mt-0 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">آخرین نوشته‌های تیم حقوقی</p>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">وبلاگ دادنوس</h2>
        </div>
        <Link href="/blog" className="rounded-2xl border border-neutral-300/70 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800/60">
          مشاهده همه مقالات
        </Link>
      </div>
      <BlogCards posts={latest} />
    </section>
  )
}
