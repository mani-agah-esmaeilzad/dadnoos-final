import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { normalizeSlug } from '@/lib/blog/slug'
import { HttpError } from '@/lib/http/errors'
import { isMissingBlogTable } from '@/lib/blog/errors'

export interface AdminBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  published: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  authorEmail: string | null
}

interface BlogPostFilters {
  page: number
  pageSize: number
  query?: string
  published?: boolean
}

export interface BlogPostInput {
  title: string
  slug: string
  excerpt?: string | null
  content: string
  coverImageUrl?: string | null
  published: boolean
}

function formatOptional(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new HttpError(409, 'اسلاگ انتخاب‌شده تکراری است.')
  }
  throw error
}

function missingTableHttpError(): never {
  throw new HttpError(500, 'جدول وبلاگ در پایگاه داده موجود نیست. لطفاً مهاجرت‌های جدید را اجرا کنید.')
}

export async function listBlogPosts({ page, pageSize, query, published }: BlogPostFilters) {
  const where: Prisma.BlogPostWhereInput = {}
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { excerpt: { contains: query, mode: 'insensitive' } },
    ]
  }
  if (typeof published === 'boolean') {
    where.published = published
  }

  try {
    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
        include: { author: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      total,
      page,
      pageSize,
      items: posts.map<AdminBlogPost>((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        published: post.published,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorEmail: post.author?.email ?? null,
      })),
    }
  } catch (error) {
    if (isMissingBlogTable(error)) {
      return {
        total: 0,
        page,
        pageSize,
        items: [],
      }
    }
    throw error
  }
}

export async function getBlogPostById(postId: string): Promise<AdminBlogPost | null> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: { author: true },
    })
    if (!post) return null
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl,
      published: post.published,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorEmail: post.author?.email ?? null,
    }
  } catch (error) {
    if (isMissingBlogTable(error)) {
      return null
    }
    throw error
  }
}

export async function createBlogPost(data: BlogPostInput, adminId: string) {
  const slug = normalizeSlug(data.slug || data.title)
  if (!slug) {
    throw new HttpError(400, 'تولید اسلاگ معتبر ممکن نیست.')
  }

  try {
    return await prisma.blogPost.create({
      data: {
        title: data.title.trim(),
        slug,
        excerpt: formatOptional(data.excerpt),
        content: data.content.trim(),
        coverImageUrl: formatOptional(data.coverImageUrl),
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        authorId: adminId,
      },
    })
  } catch (error) {
    if (isMissingBlogTable(error)) {
      missingTableHttpError()
    }
    handlePrismaError(error)
  }
}

export async function updateBlogPost(postId: string, data: BlogPostInput) {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: postId } })
    if (!existing) {
      throw new HttpError(404, 'مقاله یافت نشد.')
    }

    const slug = normalizeSlug(data.slug || data.title)
    if (!slug) {
      throw new HttpError(400, 'اسلاگ معتبر نیست.')
    }

    const now = new Date()
    const shouldPublish = data.published
    const publishedAt = shouldPublish ? existing.publishedAt ?? now : null

    return await prisma.blogPost.update({
      where: { id: postId },
      data: {
        title: data.title.trim(),
        slug,
        excerpt: formatOptional(data.excerpt),
        content: data.content.trim(),
        coverImageUrl: formatOptional(data.coverImageUrl),
        published: shouldPublish,
        publishedAt,
      },
    })
  } catch (error) {
    if (isMissingBlogTable(error)) {
      missingTableHttpError()
    }
    handlePrismaError(error)
  }
}

export async function deleteBlogPost(postId: string) {
  try {
    await prisma.blogPost.delete({
      where: { id: postId },
    })
  } catch (error) {
    if (isMissingBlogTable(error)) {
      missingTableHttpError()
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'مقاله یافت نشد.')
    }
    throw error
  }
}
