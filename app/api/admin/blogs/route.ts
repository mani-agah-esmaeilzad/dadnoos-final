import { NextRequest, NextResponse } from 'next/server'
import { AdminRole } from '@prisma/client'

import { requireAdminAuth } from '@/lib/admin/auth'
import { createBlogPost, listBlogPosts } from '@/lib/admin/blogs'
import { blogBodySchema } from '@/app/api/admin/blogs/schema'

import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  query: z.string().optional(),
  published: z.string().optional(),
})

function parsePublishedFlag(value?: string) {
  if (value === undefined) return undefined
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false') return false
  return undefined
}

function buildErrorResponse(error: unknown) {
  const status = (error as { status?: number }).status ?? 500
  const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
  return NextResponse.json({ detail: message }, { status })
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req)
    const parsed = querySchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const page = await listBlogPosts({
      page: parsed.page,
      pageSize: parsed.pageSize,
      query: parsed.query || undefined,
      published: parsePublishedFlag(parsed.published),
    })
    return NextResponse.json(page)
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuth(req, [AdminRole.ADMIN, AdminRole.SUPERADMIN])
    const body = await req.json()
    const parsed = blogBodySchema.parse(body)
    await createBlogPost(
      {
        title: parsed.title,
        slug: parsed.slug,
        excerpt: parsed.excerpt ?? null,
        content: parsed.content,
        coverImageUrl: parsed.coverImageUrl || null,
        published: parsed.published ?? false,
      },
      admin.id
    )
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
