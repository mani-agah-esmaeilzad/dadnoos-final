import { z } from 'zod'

import { ModuleConfig, ModuleFieldDefinition } from '@/lib/chat/modules'
import { createChatCompletion, type LlmMessage } from '@/lib/llm/client'

const extractionSchema = z.record(z.string(), z.string().nullable())

function buildFieldInstructions(fields: ModuleFieldDefinition[]) {
  return fields
    .map((field) => {
      const parts = [`- ${field.key}: ${field.label}`]
      if (field.description) parts.push(`(${field.description})`)
      parts.push(field.required === false ? '(اختیاری)' : '(الزامی)')
      return parts.join(' ')
    })
    .join('\n')
}

export async function extractModuleFieldValues({
  module,
  message,
  summaryJson,
  existingFields,
}: {
  module: ModuleConfig
  message: string
  summaryJson?: string | null
  existingFields: Record<string, string>
}) {
  if (!module.fields.length) {
    return existingFields
  }

  const systemContent =
    'You are an information extraction assistant. Extract field values from the provided Persian text and return ONLY valid JSON with keys and string values. Return null for unknown fields. Never invent details.'
  const instructions = [
    `ماژول: ${module.name}`,
    'اطلاعات مورد نیاز:',
    buildFieldInstructions(module.fields),
    'اگر مقدار قبلی ارائه شده و پیام جدید آن را تغییر نمی‌دهد، مقدار پیشین را نگه دار.',
  ].join('\n')

  let summaryPayload: unknown = null
  if (summaryJson) {
    try {
      summaryPayload = JSON.parse(summaryJson)
    } catch {
      summaryPayload = null
    }
  }

  const messages: LlmMessage[] = [
    { role: 'system', content: systemContent },
    {
      role: 'user',
      content: JSON.stringify({
        summary_json: summaryPayload,
        existing_fields: existingFields,
        latest_message: message,
        instructions,
      }),
    },
  ]

  const raw = await createChatCompletion({
    messages,
    temperature: 0,
    maxTokens: 400,
  })

  let parsed: Record<string, string | null>
  try {
    parsed = extractionSchema.parse(JSON.parse(raw))
  } catch (error) {
    console.warn('Field extraction failed to parse; retaining previous fields.', error)
    return existingFields
  }

  const next: Record<string, string> = { ...existingFields }
  for (const [key, value] of Object.entries(parsed)) {
    if (!value) continue
    const trimmed = value.trim()
    if (!trimmed) continue
    next[key] = trimmed
  }
  return next
}

export function getMissingRequiredFields(module: ModuleConfig, fields: Record<string, string>) {
  return module.fields.filter((field) => field.required !== false && !fields[field.key])
}

function formatQuestion(field: ModuleFieldDefinition, index: number) {
  const hint = field.description ? ` (${field.description})` : ''
  return `${index + 1}) ${field.label}${hint ? ` – ${hint}` : ''}`
}

export function buildIntakeResponse(module: ModuleConfig, missing: ModuleFieldDefinition[]) {
  const limited = missing.slice(0, 10)
  const questions = limited.map((field, idx) => formatQuestion(field, idx)).join('\n')
  return [
    `برای ادامه «${module.name}» لازم است اطلاعات زیر را مشخص کنید:`,
    questions,
    'لطفاً پاسخ‌ها را شفاف و عدددار (در صورت نیاز) ارسال کنید تا بتوانم پیش‌نویس دقیق آماده کنم.',
  ].join('\n')
}

export function formatModuleFieldsForNote(module: ModuleConfig, fields: Record<string, string>) {
  if (!module.fields.length || !Object.keys(fields).length) return ''
  const lines = module.fields
    .map((field) => {
      const value = fields[field.key]
      if (!value) return null
      return `${field.label}: ${value}`
    })
    .filter(Boolean)
  if (!lines.length) return ''
  return `اطلاعات تکمیل‌شده ماژول ${module.name}:\n${lines.join('\n')}`
}
