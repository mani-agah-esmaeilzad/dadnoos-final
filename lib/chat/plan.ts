import { prisma } from '@/lib/db/prisma'
import { getModuleById, type ModuleRegistryEntry } from '@/lib/agent/registry'
import { ModuleConfig, ModuleId, getModuleConfig } from '@/lib/chat/modules'
import {
  ConversationMetadata,
  getModuleFields,
  parseConversationMetadata,
  setActiveModule,
  setRouterDecision,
  updateModuleFields,
} from '@/lib/chat/sessionMetadata'
import {
  buildIntakeResponse,
  extractModuleFieldValues,
  formatModuleFieldsForNote,
  getMissingRequiredFields,
} from '@/lib/chat/intake'
import { selectModule } from '@/lib/chat/router'
import { lookupLegalArticles } from '@/lib/legal/articles/lookup'
import { recordTrackingEvent } from '@/lib/tracking/events'

export interface ConversationPlanInput {
  userId: string
  chatId: string
  message: string
  summaryJson?: string | null
  history: { role: 'user' | 'assistant'; content: string }[]
  sessionMetadata?: ConversationMetadata | null
  moduleOverride?: ModuleId | null
}

type ModuleSelection = Awaited<ReturnType<typeof selectModule>>

export interface ConversationPlanResult {
  moduleId: ModuleId
  modulePrompt?: ModuleRegistryEntry
  metadataNote?: string
  articleLookupJson?: string | null
  metadata: ConversationMetadata
  mode: 'agent' | 'intake'
  intakeResponse?: string
  routerDecision: ModuleSelection['routerDecision']
}

const DOMAIN_LAWS: Record<string, string[]> = {
  contracts: ['قانون مدنی', 'قانون تجارت'],
  procedure: ['قانون آیین دادرسی مدنی', 'قانون آیین دادرسی کیفری'],
  family: ['قانون حمایت خانواده ۱۳۹۱'],
  general: [],
}

function shouldLookupArticles(message: string) {
  const patterns = [/ماده/i, /مستند\s*قانونی/i, /کدام\s*قانون/i, /استناد/i]
  return patterns.some((pattern) => pattern.test(message))
}

function normalizeMetadata(raw: ConversationMetadata | null | undefined) {
  return parseConversationMetadata(raw)
}

export async function planConversation({
  userId,
  chatId,
  message,
  summaryJson,
  history,
  sessionMetadata,
}: ConversationPlanInput): Promise<ConversationPlanResult> {
  const metadata = normalizeMetadata(sessionMetadata)
  let routing: ModuleSelection
  if (moduleOverride) {
    routing = {
      module: moduleOverride,
      routerDecision: {
        module: moduleOverride,
        confidence: 1,
        required_metadata: [],
        notes: 'manual_override',
        decidedAt: new Date().toISOString(),
      },
      followUp: false,
      explicitIntent: moduleOverride,
    }
  } else {
    routing = await selectModule({ message, summaryJson, history, metadata })
  }
  await recordTrackingEvent({
    userId,
    eventType: 'router_decision',
    source: moduleOverride ? 'chat_router_override' : 'chat_router',
    payload: {
      module: routing.routerDecision.module,
      confidence: routing.routerDecision.confidence,
      notes: routing.routerDecision.notes,
    },
  })

  setRouterDecision(metadata, routing.routerDecision)
  setActiveModule(metadata, routing.module)

  const modulePromptEntry = await getModuleById(routing.module)
  const modulePrompt = modulePromptEntry?.content
  let metadataNote = ''
  let articleLookupJson: string | null = null
  let intakeResponse: string | undefined
  let mode: ConversationPlanResult['mode'] = 'agent'

  const moduleConfig: ModuleConfig = getModuleConfig(routing.module)

  if (moduleConfig.fields.length) {
    const existingFields = getModuleFields(metadata, routing.module)
    const nextFields =
      moduleConfig.fields.length > 0
        ? await extractModuleFieldValues({
            module: moduleConfig,
            message,
            summaryJson,
            existingFields,
          })
        : existingFields
    updateModuleFields(metadata, routing.module, nextFields)

    const missing = getMissingRequiredFields(moduleConfig, nextFields)
    if (moduleConfig.intakeRequired && missing.length) {
      intakeResponse = buildIntakeResponse(moduleConfig, missing)
      mode = 'intake'
    }

    metadataNote = formatModuleFieldsForNote(moduleConfig, nextFields)
  }

  if (mode === 'agent' && shouldLookupArticles(message)) {
    const domainLaws = DOMAIN_LAWS[moduleConfig.domain] ?? []
    const lookup = lookupLegalArticles({
      domain: moduleConfig.domain,
      question: message,
      candidateLaws: domainLaws,
    })
    if (lookup.status === 'found' && lookup.results.length) {
      articleLookupJson = JSON.stringify({
        domain: moduleConfig.domain,
        results: lookup.results,
        source: 'local_catalog',
      })
    }
  }

  const metadataPayload = JSON.parse(JSON.stringify(metadata))

  await prisma.chatSession.update({
    where: { userId_chatId: { userId, chatId } },
    data: { metadata: metadataPayload },
  })

  return {
    moduleId: routing.module,
    modulePrompt: modulePromptEntry,
    metadataNote: metadataNote || undefined,
    articleLookupJson,
    metadata,
    mode,
    intakeResponse,
    routerDecision: routing.routerDecision,
  }
}
