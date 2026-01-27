import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'

import { deserializeContent, partsToPlainText } from '@/lib/chat/messages'

const CONVERSATION_SEPARATOR = '::'

export function encodeConversationId(userId: string, chatId: string) {
  return `${userId}${CONVERSATION_SEPARATOR}${chatId}`
}

export function decodeConversationId(id: string) {
  const [userId, chatId] = id.split(CONVERSATION_SEPARATOR)
  if (!userId || !chatId) {
    throw new Error('شناسه گفتگو نامعتبر است.')
  }
  return { userId, chatId }
}

function maskSensitive(text: string) {
  if (!text) return text
  return text.replace(/[\d]{4,}/g, '***').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '***')
}

export interface SupportListParams {
  page: number
  pageSize: number
  query?: string
  userId?: string
  from?: Date
  to?: Date
  flag?: 'any' | 'support' | 'reported'
}

export async function listSupportConversations({
  page,
  pageSize,
  query,
  userId,
  from,
  to,
  flag,
}: SupportListParams) {
  const andConditions: Prisma.ChatSessionWhereInput[] = []

  if (userId) {
    andConditions.push({ userId })
  }

  if (from || to) {
    andConditions.push({
      createdAt: {
        gte: from,
        lte: to,
      },
    })
  }

  const shouldRestrictToFlags = !userId
  if (flag === 'support') {
    andConditions.push({ supportRequested: true })
  } else if (flag === 'reported') {
    andConditions.push({ reported: true })
  } else if (shouldRestrictToFlags) {
    andConditions.push({
      OR: [{ supportRequested: true }, { reported: true }],
    })
  }

  if (query) {
    andConditions.push({
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { user: { username: { contains: query, mode: 'insensitive' } } },
      ],
    })
  }

  const where: Prisma.ChatSessionWhereInput = andConditions.length ? { AND: andConditions } : {}

  const [total, sessions] = await Promise.all([
    prisma.chatSession.count({ where }),
    prisma.chatSession.findMany({
      where,
      include: {
        user: { select: { username: true } },
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const items = sessions.map((session) => {
    const lastMessage = session.messages[0]
    let snippet = ''
    if (lastMessage) {
      const parts = deserializeContent(lastMessage.content)
      snippet = maskSensitive(partsToPlainText(parts))
    }
    return {
      conversationId: encodeConversationId(session.userId, session.chatId),
      userId: session.userId,
      username: session.user?.username ?? 'نامشخص',
      chatId: session.chatId,
      supportRequested: session.supportRequested,
      reported: session.reported,
      createdAt: session.createdAt,
      lastMessageAt: lastMessage?.timestamp ?? session.createdAt,
      lastMessageSnippet: snippet,
      title: session.title,
    }
  })

  return {
    total,
    page,
    pageSize,
    items,
  }
}

export async function getConversationTranscript({
  userId,
  chatId,
  cursor,
  pageSize,
}: {
  userId: string
  chatId: string
  cursor?: string
  pageSize: number
}) {
  const session = await prisma.chatSession.findUnique({
    where: { userId_chatId: { userId, chatId } },
    select: {
      supportRequested: true,
      reported: true,
    },
  })
  if (!session) {
    return null
  }

  const query: Prisma.MessageFindManyArgs = {
    where: { userId, chatId },
    orderBy: [
      { timestamp: 'asc' },
      { id: 'asc' },
    ],
    take: pageSize + 1,
  }

  if (cursor) {
    query.cursor = { id: cursor }
    query.skip = 1
  }

  const records = await prisma.message.findMany(query)
  const hasMore = records.length > pageSize
  const slice = hasMore ? records.slice(0, pageSize) : records
  const nextCursor = hasMore ? slice[slice.length - 1]?.id : null

  const messages = slice.map((message) => {
    const parts = deserializeContent(message.content)
    return {
      id: message.id,
      role: message.role,
      text: maskSensitive(partsToPlainText(parts)),
      timestamp: message.timestamp,
    }
  })

  return {
    conversationId: encodeConversationId(userId, chatId),
    userId,
    chatId,
    messages,
    nextCursor,
    supportRequested: session.supportRequested,
    reported: session.reported,
  }
}
