import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { detail: 'استریم فعلاً غیرفعال است؛ از /api/v1/chat استفاده کنید.' },
    { status: 501 }
  )
}
