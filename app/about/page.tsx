import Navbar from '@/app/_ui/navbar'
import Footer from '@/app/_ui/footer'
import FeaturesSection from '@/app/_ui/about/FeaturesSection'
import BlogSection from '@/app/_ui/about/BlogSection'
import AboutScrollManager from '@/app/about/scroll-to-footer'
import { listPublishedBlogPosts } from '@/lib/blog/posts'

export const revalidate = 60

export const metadata = {
  title: 'معرفی دادنوس',
}

export default async function AboutPage() {
  const blogPosts = await listPublishedBlogPosts(6)

  return (
    <>
      <AboutScrollManager />

      <div className="items-center justify-items-center" dir="auto">
        <Navbar />

        <div className="font-sans p-4 sm:p-20 pb-10 pt-safe-20">
          <main className="flex flex-col gap-[32px] row-start-2 items-center">
            <div className="min-h-screen space-y-4 pb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-center pt-10 md:-mt-5 md:pt-0 pb-10">
                معرفی دادنوس:
              </h1>

              <FeaturesSection />
            </div>

            <BlogSection posts={blogPosts} />
          </main>
        </div>
      </div>

      <Footer />
    </>
  )
}
