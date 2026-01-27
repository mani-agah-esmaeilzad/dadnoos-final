import type { PromptConfigDTO } from '@/lib/prompts/service'
import { buildModulePromptSlug, getPromptConfig, listPromptConfigs } from '@/lib/prompts/service'

export type PromptEntry = PromptConfigDTO
export type ModuleRegistryEntry = PromptConfigDTO

export async function getCorePromptEntry(): Promise<PromptEntry> {
  return getPromptConfig('core')
}

export async function getRouterPromptEntry(): Promise<PromptEntry> {
  return getPromptConfig('router')
}

export async function getModuleEntries(): Promise<ModuleRegistryEntry[]> {
  const prompts = await listPromptConfigs()
  return prompts.filter((prompt) => prompt.slug.startsWith('module:'))
}

export async function getModuleById(id: string): Promise<ModuleRegistryEntry | undefined> {
  try {
    return await getPromptConfig(buildModulePromptSlug(id))
  } catch {
    return undefined
  }
}
