import { NextRequest, NextResponse } from 'next/server'
import { AdminRole } from '@prisma/client'

import { requireAdminAuth } from '@/lib/admin/auth'
import { deleteBlogPost, getBlogPostById, updateBlogPost } from '@/lib/admin/blogs'
import { blogBodySchema } from '@/app/api/admin/blogs/schema'

function buildErrorResponse(error: unknown) {
  const status = (error as { status?: number }).status ?? 500
  const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
  return NextResponse.json({ detail: message }, { status })
}

export async function GET(req: NextRequest, context: { params: Promise<{ postId: string }> }) {
  try {
    await requireAdminAuth(req)
    const { postId } = await context.params
    const post = await getBlogPostById(postId)
    if (!post) {
      return NextResponse.json({ detail: 'مقاله یافت نشد.' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ postId: string }> }) {
  try {
    await requireAdminAuth(req, [AdminRole.ADMIN, AdminRole.SUPERADMIN])
    const { postId } = await context.params
    const body = await req.json()
    const parsed = blogBodySchema.parse(body)
    await updateBlogPost(postId, {
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt ?? null,
      content: parsed.content,
      coverImageUrl: parsed.coverImageUrl || null,
      published: parsed.published ?? false,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return buildErrorResponse(error)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ postId: string }> }) {
  try {
    await requireAdminAuth(req, [AdminRole.ADMIN, AdminRole.SUPERADMIN])
    const { postId } = await context.params
    await deleteBlogPost(postId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
