import type { LlmMessage } from '@/lib/llm/client'
import { countTokens } from '@/lib/llm/tokenizer'

export function estimateTokensFromText(text: string) {
  const tokens = countTokens(text || '')
  return tokens > 0 ? tokens : 1
}

export function estimateTokensFromMessages(messages: LlmMessage[]) {
  return messages.reduce((sum, msg) => {
    const contentTokens = countTokens(msg.content || '')
    return sum + Math.max(contentTokens, 1)
  }, 0)
}
