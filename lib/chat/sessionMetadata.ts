import { ModuleId } from '@/lib/chat/modules'

export interface RouterDecision {
  module: ModuleId
  confidence: number
  required_metadata: string[]
  notes?: string
  decidedAt: string
}

export interface ModuleContextEntry {
  fields: Record<string, string>
  updatedAt: string
}

export interface ConversationMetadata {
  activeModule?: ModuleId
  activeModuleSince?: string
  lastRouterDecision?: RouterDecision
  moduleContext?: Partial<Record<ModuleId, ModuleContextEntry>>
}

export function parseConversationMetadata(value: unknown): ConversationMetadata {
  if (!value || typeof value !== 'object') return {}
  try {
    const parsed = JSON.parse(JSON.stringify(value)) as ConversationMetadata
    return {
      activeModule: parsed.activeModule,
      activeModuleSince: parsed.activeModuleSince,
      lastRouterDecision: parsed.lastRouterDecision,
      moduleContext: parsed.moduleContext,
    }
  } catch {
    return {}
  }
}

export function setActiveModule(metadata: ConversationMetadata, module: ModuleId) {
  const now = new Date().toISOString()
  metadata.activeModule = module
  metadata.activeModuleSince = now
}

export function setRouterDecision(metadata: ConversationMetadata, decision: RouterDecision) {
  metadata.lastRouterDecision = decision
}

export function getModuleFields(metadata: ConversationMetadata, module: ModuleId) {
  return metadata.moduleContext?.[module]?.fields ?? {}
}

export function updateModuleFields(metadata: ConversationMetadata, module: ModuleId, fields: Record<string, string>) {
  const now = new Date().toISOString()
  if (!metadata.moduleContext) {
    metadata.moduleContext = {}
  }
  metadata.moduleContext[module] = {
    fields,
    updatedAt: now,
  }
}
