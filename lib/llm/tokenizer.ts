import { env } from '@/lib/env'

import { countTokens as countCl100kBase } from 'gpt-tokenizer/encoding/cl100k_base'
import { countTokens as countO200kBase } from 'gpt-tokenizer/encoding/o200k_base'
import { countTokens as countO200kHarmony } from 'gpt-tokenizer/encoding/o200k_harmony'
import { countTokens as countP50kBase } from 'gpt-tokenizer/encoding/p50k_base'
import { countTokens as countP50kEdit } from 'gpt-tokenizer/encoding/p50k_edit'
import { countTokens as countR50kBase } from 'gpt-tokenizer/encoding/r50k_base'
import {
  cl100k_base as cl100kModels,
  o200k_base as o200kModels,
  o200k_harmony as o200kHarmonyModels,
  p50k_base as p50kModels,
  p50k_edit as p50kEditModels,
  r50k_base as r50kModels,
} from 'gpt-tokenizer/modelsMap'

type EncodingName = 'o200k_base' | 'o200k_harmony' | 'cl100k_base' | 'p50k_base' | 'p50k_edit' | 'r50k_base'

type TokenCounter = (text: string) => number

const ENCODING_COUNTERS: Record<EncodingName, TokenCounter> = {
  o200k_base: (text) => countO200kBase(text),
  o200k_harmony: (text) => countO200kHarmony(text),
  cl100k_base: (text) => countCl100kBase(text),
  p50k_base: (text) => countP50kBase(text),
  p50k_edit: (text) => countP50kEdit(text),
  r50k_base: (text) => countR50kBase(text),
}

const DEFAULT_ENCODING: EncodingName = 'o200k_base'

const MODEL_TO_ENCODING = new Map<string, EncodingName>()

function registerModels(models: readonly string[], encoding: EncodingName) {
  for (const model of models) {
    MODEL_TO_ENCODING.set(model.toLowerCase(), encoding)
  }
}

registerModels(o200kModels, 'o200k_base')
registerModels(o200kHarmonyModels, 'o200k_harmony')
registerModels(cl100kModels, 'cl100k_base')
registerModels(p50kModels, 'p50k_base')
registerModels(p50kEditModels, 'p50k_edit')
registerModels(r50kModels, 'r50k_base')

function resolveEncoding(modelName?: string | null): EncodingName {
  if (!modelName) return DEFAULT_ENCODING
  const normalized = modelName.trim().toLowerCase()
  if (!normalized) return DEFAULT_ENCODING
  return MODEL_TO_ENCODING.get(normalized) ?? DEFAULT_ENCODING
}

export function countTokens(text: string, modelOverride?: string) {
  if (!text) return 0
  const encoding = resolveEncoding(modelOverride || env.LLM_MODEL)
  const counter = ENCODING_COUNTERS[encoding] || ENCODING_COUNTERS[DEFAULT_ENCODING]
  return counter(text)
}
