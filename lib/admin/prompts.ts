import { PromptConfigDTO, listPromptConfigs, resetPromptToDefault, upsertPromptConfig } from '@/lib/prompts/service'

export async function listAdminPrompts() {
  return listPromptConfigs()
}

export async function saveAdminPrompt(slug: string, data: { content: string; model?: string | null }) {
  return upsertPromptConfig(slug, data)
}

export async function resetAdminPrompt(slug: string): Promise<PromptConfigDTO> {
  return resetPromptToDefault(slug)
}
