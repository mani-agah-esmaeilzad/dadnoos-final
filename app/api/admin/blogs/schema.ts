import { z } from 'zod'

export const blogBodySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(2),
  excerpt: z.string().max(600).optional(),
  content: z.string().min(10),
  coverImageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  published: z.boolean().optional(),
})

export type BlogBodyInput = z.infer<typeof blogBodySchema>
