import fs from 'node:fs'
import path from 'node:path'

import { PromptType } from '@prisma/client'

export interface DefaultPromptEntry {
  slug: string
  type: PromptType
  name: string
  content: string
  model?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
}

interface RegistryEntry {
  id: string
  name: string
  content: string
  model?: string | null
}

interface PromptRegistryFile {
  core: RegistryEntry & { alwaysOn?: boolean }
  router: RegistryEntry
  modules: RegistryEntry[]
}

let cachedDefaults: DefaultPromptEntry[] | null = null

function loadRegistryFile(): PromptRegistryFile {
  const registryPath = path.join(process.cwd(), 'prompts', 'registry.json')
  const raw = fs.readFileSync(registryPath, 'utf-8')
  const parsed = JSON.parse(raw) as PromptRegistryFile
  return parsed
}

function loadSystemPrompt(): string {
  const promptPath = path.join(process.cwd(), 'prompts', 'system.md')
  return fs.readFileSync(promptPath, 'utf-8')
}

function buildDefaultEntries(): DefaultPromptEntry[] {
  const registry = loadRegistryFile()
  const systemPrompt = loadSystemPrompt()

  const defaults: DefaultPromptEntry[] = []

  defaults.push({
    slug: 'core',
    type: PromptType.CORE,
    name: registry.core?.name || 'VakilAssist Core',
    content: systemPrompt || registry.core?.content || '',
    metadata: registry.core?.alwaysOn ? { alwaysOn: true } : undefined,
  })

  defaults.push({
    slug: 'router',
    type: PromptType.ROUTER,
    name: registry.router?.name || 'Module Router',
    content: registry.router?.content || '',
  })

  if (Array.isArray(registry.modules)) {
    registry.modules.forEach((module) => {
      defaults.push({
        slug: `module:${module.id}`,
        type: PromptType.MODULE,
        name: module.name,
        content: module.content,
        metadata: { moduleId: module.id },
      })
    })
  }

  return defaults
}

function ensureDefaultsLoaded() {
  if (!cachedDefaults) {
    cachedDefaults = buildDefaultEntries()
  }
}

export function getDefaultPrompts(): DefaultPromptEntry[] {
  ensureDefaultsLoaded()
  return cachedDefaults!.map((entry) => ({ ...entry }))
}

export function getDefaultPromptBySlug(slug: string): DefaultPromptEntry | undefined {
  ensureDefaultsLoaded()
  return cachedDefaults!.find((entry) => entry.slug === slug)
}
