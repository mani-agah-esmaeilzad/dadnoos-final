import { describe, expect, it } from 'vitest'

import { lookupLegalArticles } from '@/lib/legal/articles/lookup'

describe('article lookup', () => {
  it('returns matching articles for keywords', () => {
    const result = lookupLegalArticles({
      question: 'برای صحت قرارداد چه شرایطی لازم است؟',
      domain: 'contracts',
    })
    expect(result.status).toBe('found')
    expect(result.results[0].law).toBe('قانون مدنی')
  })

  it('handles missing matches gracefully', () => {
    const result = lookupLegalArticles({
      question: 'چیزی درباره مالیات بر عایدی سرمایه می‌خواهم',
    })
    expect(result.status).toBe('not_found')
    expect(result.results).toHaveLength(0)
  })
})
