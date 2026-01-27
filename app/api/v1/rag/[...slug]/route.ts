import { NextRequest, NextResponse } from 'next/server'

function gone() {
  return NextResponse.json(
    {
      detail: 'RAG endpoints are deprecated in the new system-prompt agent.',
    },
    { status: 410 }
  )
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return gone()
}

export async function POST(req: NextRequest) {
  return gone()
}

export async function DELETE(req: NextRequest) {
  return gone()
}

export async function PATCH(req: NextRequest) {
  return gone()
}
