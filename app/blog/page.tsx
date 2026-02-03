import Navbar from '@/app/_ui/navbar'
import Footer from '@/app/_ui/footer'
import BlogCards from '@/app/_ui/blog/BlogCards'
import { listPublishedBlogPosts } from '@/lib/blog/posts'

export const revalidate = 60

export const metadata = {
  title: 'وبلاگ دادنوس',
}

export default async function BlogLandingPage() {
  const posts = await listPublishedBlogPosts()

  return (
    <>
      <Navbar />
      <section className="mx-auto max-w-6xl space-y-8 px-4 py-16 md:px-6 md:py-20">
        <div className="space-y-2 text-center">
          <p className="text-sm text-neutral-500">دانش حقوقی به زبان ساده</p>
          <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100">وبلاگ دادنوس</h1>
          <p className="text-sm text-neutral-500">
            جدیدترین یادداشت‌ها و تحلیل‌های تیم حقوقی ما برای کاربران و مدیران کسب‌وکار.
          </p>
        </div>

        <BlogCards posts={posts} className="md:mt-6" />
      </section>
      <Footer />
    </>
  )
}
