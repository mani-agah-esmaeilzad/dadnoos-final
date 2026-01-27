import { z } from 'zod'

export const imageSchema = z.object({
  base64: z.string().optional(),
  url: z.string().optional(),
  mime_type: z.string().optional(),
})

export const attachmentSchema = z.object({
  base64: z.string().optional(),
  url: z.string().optional(),
  mime_type: z.string().optional(),
  filename: z.string().optional(),
})

export const chatRequestSchema = z.object({
  chat_id: z.string().min(1),
  message: z.string().optional(),
  prompt: z.string().optional(),
  user_id: z.string().optional(),
  images: z.array(imageSchema).optional(),
  attachments: z.array(attachmentSchema).optional(),
})

export type ChatRequestInput = z.infer<typeof chatRequestSchema>
