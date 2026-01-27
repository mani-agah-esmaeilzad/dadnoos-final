import crypto from 'node:crypto'

import { prisma } from '@/lib/db/prisma'
import { saveDocumentBase64, saveImageBase64 } from '@/lib/files/storage'
import { extractAttachmentSummary } from '@/lib/attachments/extract'
import type { ChatRequestInput } from '@/lib/chat/schema'
import { ContentPart, partsToPlainText, serializeContent } from '@/lib/chat/messages'
import { HttpError } from '@/lib/http/errors'
import type { ConversationTurn } from '@/lib/agent/runner'
import { estimateTokensFromText } from '@/lib/llm/tokens'
import { buildConversationMemory } from '@/lib/chat/memory'
import { ConversationMetadata, parseConversationMetadata } from '@/lib/chat/sessionMetadata'

const ATTACHMENT_CONTEXT_LIMIT = 5
const FALLBACK_ATTACHMENT_NOTE = 'متن استخراج نشد.'

export interface AttachmentMeta {
  name?: string | null
  mime?: string | null
  size?: number | null
  summary?: string | null
}

export interface PreparedChatContext {
  sessionChatId: string
  sessionMetadata: ConversationMetadata
  history: ConversationTurn[]
  userPlainText: string
  attachmentContext: AttachmentMeta[]
  summaryJson: string | null
}

function ensureParts(parts: ContentPart[]) {
  if (!parts.length) {
    throw new HttpError(400, 'لطفاً پیام یا فایل ارسال کنید.')
  }
}

async function summarizeAttachments(userId: string, chatId: string): Promise<AttachmentMeta[]> {
  const records = await prisma.chatAttachment.findMany({
    where: { userId, chatId },
    orderBy: { createdAt: 'desc' },
    take: ATTACHMENT_CONTEXT_LIMIT,
  })
  return records.map((att) => ({
    name: att.fileName,
    mime: att.mimeType,
    size: att.sizeBytes,
    summary: att.summary || FALLBACK_ATTACHMENT_NOTE,
  }))
}

export async function prepareChatContext(userId: string, body: ChatRequestInput): Promise<PreparedChatContext> {
  const session = await prisma.chatSession.upsert({
    where: { userId_chatId: { userId, chatId: body.chat_id } },
    update: {},
    create: { userId, chatId: body.chat_id },
  })

  const parts: ContentPart[] = []
  if (body.message && body.message.trim()) {
    parts.push({ type: 'text', text: body.message.trim() })
  }

  if (body.images) {
    for (const image of body.images) {
      if (image?.base64) {
        const saved = saveImageBase64(image.base64, image.mime_type)
        parts.push({ type: 'image_url', image_url: { url: saved.url } })
      } else if (image?.url) {
        parts.push({ type: 'image_url', image_url: { url: image.url } })
      }
    }
  }

  if (body.attachments) {
    for (const attachment of body.attachments) {
      if (attachment?.base64) {
        const saved = saveDocumentBase64(attachment.base64, attachment.mime_type)
        const record = await prisma.chatAttachment.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            chatId: session.chatId,
            fileName: attachment.filename || saved.filename,
            mimeType: saved.mime,
            fileUrl: saved.url,
            sizeBytes: saved.size,
          },
        })
        const summary = await extractAttachmentSummary(saved.absolutePath, saved.mime)
        if (summary) {
          await prisma.chatAttachment.update({ where: { id: record.id }, data: { summary } })
        }
        parts.push({
          type: 'file',
          url: saved.url,
          name: attachment.filename || saved.filename,
          mime_type: saved.mime,
        })
      } else if (attachment?.url) {
        parts.push({ type: 'file', url: attachment.url, name: attachment.filename, mime_type: attachment.mime_type })
      }
    }
  }

  ensureParts(parts)

  const plainText = partsToPlainText(parts)
  const userTokenCount = estimateTokensFromText(plainText)

  const latestMessage = await prisma.message.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      chatId: body.chat_id,
      role: 'user',
      content: serializeContent(parts),
      tokenCount: userTokenCount,
    },
  })

  const memory = await buildConversationMemory({
    userId,
    chatId: body.chat_id,
    excludeMessageId: latestMessage.id,
  })

  return {
    sessionChatId: session.chatId,
    sessionMetadata: parseConversationMetadata(session.metadata),
    history: memory.history,
    userPlainText: plainText,
    summaryJson: memory.summaryJson,
    attachmentContext: await summarizeAttachments(userId, session.chatId),
  }
}
