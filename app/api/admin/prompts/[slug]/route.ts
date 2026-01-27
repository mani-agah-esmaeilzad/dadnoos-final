import { NextRequest, NextResponse } from 'next/server'
import { AdminRole } from '@prisma/client'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/admin/auth'
import { resetAdminPrompt, saveAdminPrompt } from '@/lib/admin/prompts'

const bodySchema = z.object({
  content: z.string().min(10),
  model: z.string().min(2).max(128).optional().nullable(),
})

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminAuth(req, [AdminRole.ADMIN, AdminRole.SUPERADMIN])
    const { slug } = await context.params
    const body = await req.json()
    const parsed = bodySchema.parse(body)
    const prompt = await saveAdminPrompt(slug, {
      content: parsed.content,
      model: parsed.model ?? undefined,
    })
    return NextResponse.json(prompt)
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminAuth(req, [AdminRole.ADMIN, AdminRole.SUPERADMIN])
    const { slug } = await context.params
    const prompt = await resetAdminPrompt(slug)
    return NextResponse.json(prompt)
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
