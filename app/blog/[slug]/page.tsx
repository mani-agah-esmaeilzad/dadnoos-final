import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

import Navbar from '@/app/_ui/navbar'
import Footer from '@/app/_ui/footer'
import { getPublishedBlogPost } from '@/lib/blog/posts'

function formatDate(value: Date | string | null) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'long',
  }).format(date)
}

const markdownComponents: Components = {
  h1: (props) => <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100" {...props} />,
  h2: (props) => <h2 className="mt-8 text-2xl font-bold text-neutral-900 dark:text-neutral-100" {...props} />,
  h3: (props) => <h3 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100" {...props} />,
  h4: (props) => <h4 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100" {...props} />,
  p: (props) => <p className="my-4 leading-8 text-neutral-700 dark:text-neutral-200" {...props} />,
  ul: (props) => <ul className="my-4 list-disc pr-5 leading-7 text-neutral-700 dark:text-neutral-200" {...props} />,
  ol: (props) => <ol className="my-4 list-decimal pr-5 leading-7 text-neutral-700 dark:text-neutral-200" {...props} />,
  li: (props) => <li className="my-2" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-6 border-r-4 border-neutral-200 pr-4 italic text-neutral-600 dark:border-neutral-700 dark:text-neutral-300" {...props} />
  ),
  a: (props) => <a className="font-semibold text-[#9b956d] underline-offset-2 hover:underline" {...props} />,
  code({
    className,
    children,
    inline,
    ...props
  }: React.ComponentProps<'code'> & { inline?: boolean }) {
    if (inline) {
      return (
        <code className="rounded-xl bg-neutral-100 px-1.5 py-0.5 text-sm text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100" {...props}>
          {children}
        </code>
      )
    }
    return (
      <pre className="my-5 overflow-x-auto rounded-2xl bg-neutral-900/90 p-4 text-sm text-neutral-50">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    )
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedBlogPost(slug)
  if (!post) {
    return {
      title: 'مقاله یافت نشد',
    }
  }
  return {
    title: `${post.title} | وبلاگ دادنوس`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedBlogPost(slug)
  if (!post) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-0 md:py-16">
        <div className="text-sm text-neutral-500">
          <Link href="/about" className="hover:text-neutral-700">
            معرفی دادنوس
          </Link>{' '}
          /{' '}
          <Link href="/blog" className="hover:text-neutral-700">
            وبلاگ
          </Link>
        </div>
        <h1 className="mt-4 text-4xl font-black text-neutral-900 dark:text-neutral-50">{post.title}</h1>
        <div className="mt-2 text-sm text-neutral-500">{formatDate(post.publishedAt)}</div>
        {post.coverImageUrl && (
          <div
            className="mt-8 h-72 w-full rounded-3xl bg-neutral-200 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.coverImageUrl})` }}
          />
        )}
        <div className="mt-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
      <Footer />
    </>
  )
}
