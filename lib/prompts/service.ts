import { Prisma, type PromptType } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { DefaultPromptEntry, getDefaultPromptBySlug, getDefaultPrompts } from '@/lib/prompts/defaults'

export type PromptSource = 'default' | 'database'

export interface PromptConfigDTO {
  id?: string
  slug: string
  type: PromptType
  name: string
  content: string
  model?: string | null
  description?: string | null
  metadata?: unknown
  source: PromptSource
  updatedAt?: Date
  createdAt?: Date
}

export function buildModulePromptSlug(moduleId: string) {
  return `module:${moduleId}`
}

function mapDefault(entry: DefaultPromptEntry): PromptConfigDTO {
  return {
    slug: entry.slug,
    type: entry.type,
    name: entry.name,
    content: entry.content,
    model: entry.model ?? null,
    description: entry.description ?? null,
    metadata: entry.metadata ?? null,
    source: 'default',
  }
}

function mapDb(entry: {
  id: string
  slug: string
  type: PromptType
  name: string
  content: string
  model: string | null
  description: string | null
  metadata: unknown
  createdAt: Date
  updatedAt: Date
}): PromptConfigDTO {
  return {
    id: entry.id,
    slug: entry.slug,
    type: entry.type,
    name: entry.name,
    content: entry.content,
    model: entry.model,
    description: entry.description,
    metadata: entry.metadata,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    source: 'database',
  }
}

function normalizeModelInput(model?: string | null) {
  if (!model) return null
  const trimmed = model.trim()
  return trimmed.length ? trimmed : null
}

function normalizeMetadataInput(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

export async function getPromptConfig(slug: string): Promise<PromptConfigDTO> {
  const dbEntry = await prisma.promptConfig.findUnique({ where: { slug } })
  if (dbEntry) {
    return mapDb(dbEntry)
  }
  const fallback = getDefaultPromptBySlug(slug)
  if (!fallback) {
    throw new Error(`Prompt not found for slug: ${slug}`)
  }
  return mapDefault(fallback)
}

export async function listPromptConfigs(): Promise<PromptConfigDTO[]> {
  const defaults = getDefaultPrompts()
  const dbEntries = await prisma.promptConfig.findMany()
  const dbBySlug = new Map(dbEntries.map((entry) => [entry.slug, entry]))

  const combined: PromptConfigDTO[] = defaults.map((entry) => {
    const override = dbBySlug.get(entry.slug)
    if (override) {
      return mapDb(override)
    }
    return mapDefault(entry)
  })

  dbEntries.forEach((entry) => {
    if (!defaults.find((def) => def.slug === entry.slug)) {
      combined.push(mapDb(entry))
    }
  })

  return combined
}

export async function upsertPromptConfig(slug: string, data: { content: string; model?: string | null }) {
  const fallback = getDefaultPromptBySlug(slug)
  if (!fallback) {
    const existing = await prisma.promptConfig.findUnique({ where: { slug } })
    if (!existing) {
      throw new Error(`Prompt definition for slug "${slug}" not found.`)
    }
    const modelValue = normalizeModelInput(data.model)
    const record = await prisma.promptConfig.update({
      where: { slug },
      data: {
        content: data.content,
        model: modelValue,
      },
    })
    return mapDb(record)
  }

  const modelValue = normalizeModelInput(data.model)
  const payload = {
    content: data.content,
    model: modelValue,
  }

  const record = await prisma.promptConfig.upsert({
    where: { slug },
    update: payload,
    create: {
      slug,
      type: fallback.type,
      name: fallback.name,
      content: data.content,
      model: modelValue,
      description: fallback.description,
      metadata: normalizeMetadataInput(fallback.metadata),
    },
  })
  return mapDb(record)
}

export async function resetPromptToDefault(slug: string) {
  const fallback = getDefaultPromptBySlug(slug)
  if (!fallback) {
    throw new Error(`Prompt definition for slug "${slug}" not found.`)
  }
  await prisma.promptConfig.deleteMany({ where: { slug } })
  return mapDefault(fallback)
}
