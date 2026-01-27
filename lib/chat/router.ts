import { z } from 'zod'

import { getRouterPromptEntry } from '@/lib/agent/registry'
import { ModuleId, MODULE_CONFIGS } from '@/lib/chat/modules'
import type { ConversationMetadata, RouterDecision } from '@/lib/chat/sessionMetadata'
import { createChatCompletion } from '@/lib/llm/client'

const MODULE_IDS = Object.keys(MODULE_CONFIGS) as ModuleId[]

const ROUTER_OUTPUT_SCHEMA = z.object({
  module: z.enum(MODULE_IDS),
  confidence: z
    .number()
    .min(0)
    .max(1),
  required_metadata: z.array(z.string()).max(8),
  notes: z.string().default(''),
})

export function detectFollowUp(text: string) {
  const normalized = text.trim()
  if (!normalized) return false
  const patterns = [
    /ادامه( بده| بدهید| بده)/i,
    /یه (مرحله|بخش) بعد/i,
    /او?کی،?\s*ادامه/i,
    /مثل قبل/i,
    /برو بعدی/i,
    /^باشه/i,
    /^حتما/i,
    /^او?کی/i,
  ]
  return patterns.some((pattern) => pattern.test(normalized))
}

const MODULE_KEYWORDS: Record<ModuleId, RegExp[]> = {
  contract_review: [
    /تحلیل قرارداد/i,
    /خلاصه قرارداد/i,
    /بررسی بند/i,
    /ریسک قرارداد/i,
  ],
  document_brief_analysis: [
    /تحلیل (لایحه|رای|حکم|دادخواست)/i,
    /این رأی را بررسی/i,
    /نقد لایحه/i,
  ],
  petitions_complaints: [
    /دادخواست (بنویس|تنظیم کن?)/i,
    /شکواییه/i,
    /لایحه تهیه کن/i,
    /اظهارنامه/i,
  ],
  contract_drafting: [
    /قرارداد (جدید|بنویس)/i,
    /نمونه قرارداد/i,
    /پیش نویس قرارداد/i,
  ],
  generic_chat: [],
}

export function detectExplicitModuleIntent(text: string): ModuleId | null {
  const normalized = text.trim()
  if (!normalized) return null
  for (const [module, patterns] of Object.entries(MODULE_KEYWORDS) as [ModuleId, RegExp[]][]) {
    if (!patterns.length) continue
    if (patterns.some((pattern) => pattern.test(normalized))) {
      return module
    }
  }
  return null
}

function parseRouterText(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    const pairs = trimmed.split('\n').map((line) => line.split(':'))
    const result: Record<string, string | string[]> = {}
    for (const pair of pairs) {
      if (pair.length < 2) continue
      const key = pair[0]?.trim().toLowerCase()
      const value = pair.slice(1).join(':').trim()
      if (!key) continue
      if (key === 'required_metadata') {
        if (value.startsWith('[')) {
          try {
            result[key] = JSON.parse(value)
          } catch {
            result[key] = value.split(',').map((item) => item.trim())
          }
        } else {
          result[key] = value.split(',').map((item) => item.trim())
        }
      } else {
        result[key] = value
      }
    }
    return result
  }
}

async function callRouterModel(input: { userMessage: string; summarySnippet?: string; historySnippet?: string }) {
  const routerPromptEntry = await getRouterPromptEntry()
  const routerPrompt = routerPromptEntry.content
  const payload = [
    '[زمینه فعلی]',
    input.summarySnippet ? `خلاصه: ${input.summarySnippet}` : '',
    input.historySnippet ? `آخرین پاسخ‌ها: ${input.historySnippet}` : '',
    '\n[پیام کاربر]\n',
    input.userMessage,
  ]
    .filter(Boolean)
    .join('\n')

  const raw = await createChatCompletion({
    messages: [
      { role: 'system', content: routerPrompt },
      { role: 'user', content: payload },
    ],
    temperature: 0,
    maxTokens: 200,
    model: routerPromptEntry.model ?? undefined,
  })

  const rawObject = parseRouterText(raw)
  if (!rawObject) {
    throw new Error('Router returned empty output')
  }
  const parsedDecision = ROUTER_OUTPUT_SCHEMA.parse({
    module: rawObject.module,
    confidence: Number(rawObject.confidence ?? 0),
    required_metadata: Array.isArray(rawObject.required_metadata)
      ? rawObject.required_metadata
      : typeof rawObject.required_metadata === 'string' && rawObject.required_metadata
        ? rawObject.required_metadata.split(',').map((item: string) => item.trim())
        : [],
    notes: typeof rawObject.notes === 'string' ? rawObject.notes : '',
  })
  const decision: RouterDecision = {
    ...parsedDecision,
    decidedAt: new Date().toISOString(),
  }
  return decision
}

export function applyStickyRouting({
  activeModule,
  followUp,
  explicitIntent,
  routerDecision,
}: {
  activeModule?: ModuleId
  followUp: boolean
  explicitIntent: ModuleId | null
  routerDecision: RouterDecision
}) {
  if (explicitIntent && explicitIntent !== routerDecision.module) {
    return explicitIntent
  }
  if (!activeModule) {
    return routerDecision.module
  }
  if (!followUp) {
    return routerDecision.module
  }
  const highConfidence = routerDecision.confidence >= 0.85
  const hasReason = Boolean(routerDecision.notes && routerDecision.notes.trim().length > 10)
  if (routerDecision.module !== activeModule && (!highConfidence || !hasReason)) {
    return activeModule
  }
  return routerDecision.module
}

export async function selectModule({
  message,
  summaryJson,
  history,
  metadata,
}: {
  message: string
  summaryJson?: string | null
  history: { role: 'user' | 'assistant'; content: string }[]
  metadata: ConversationMetadata
}): Promise<{
  module: ModuleId
  routerDecision: RouterDecision
  followUp: boolean
  explicitIntent: ModuleId | null
}> {
  const followUp = detectFollowUp(message)
  const explicitIntent = detectExplicitModuleIntent(message)
  let routerDecision: RouterDecision
  try {
    routerDecision = await callRouterModel({
      userMessage: message,
      summarySnippet: summaryJson ? summaryJson.slice(0, 1200) : undefined,
      historySnippet: history
        .slice(-2)
        .map((turn) => `${turn.role === 'user' ? 'کاربر' : 'دستیار'}: ${turn.content.slice(0, 200)}`)
        .join('\n'),
    })
  } catch (error) {
    console.warn('Router call failed, falling back to generic_chat.', error)
    routerDecision = {
      module: 'generic_chat',
      confidence: 0,
      required_metadata: [],
      notes: 'invalid_router_output',
      decidedAt: new Date().toISOString(),
    }
    return { module: routerDecision.module, routerDecision, followUp, explicitIntent }
  }
  const module = applyStickyRouting({
    activeModule: metadata.activeModule,
    followUp,
    explicitIntent,
    routerDecision,
  })

  return { module, routerDecision, followUp, explicitIntent }
}
