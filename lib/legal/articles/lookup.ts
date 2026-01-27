import { ARTICLE_DATA, ArticleRecord } from '@/lib/legal/articles/data'

export interface ArticleLookupInput {
  domain?: string
  keywords?: string[]
  candidateLaws?: string[]
  question?: string
}

export interface ArticleLookupHit extends ArticleRecord {
  snippet: string
  confidence: number
}

export interface ArticleLookupResponse {
  status: 'found' | 'not_found'
  results: ArticleLookupHit[]
}

function normalize(text: string) {
  return text.toLowerCase()
}

function tokenize(text: string) {
  return text
    .split(/[\s،,.؛:]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
}

export function lookupLegalArticles(input: ArticleLookupInput): ArticleLookupResponse {
  const keywords = new Set<string>()
  ;(input.keywords || []).forEach((word) => keywords.add(normalize(word)))
  if (input.question) {
    tokenize(input.question).forEach((token) => keywords.add(normalize(token)))
  }

  const keywordArray = Array.from(keywords)
  if (!keywordArray.length) {
    return { status: 'not_found', results: [] }
  }

  const candidateLaws = input.candidateLaws?.map((law) => law.trim()) ?? null

  const scored = ARTICLE_DATA.map((record) => {
    if (candidateLaws && candidateLaws.length && !candidateLaws.includes(record.law)) {
      return null
    }
    const haystack = normalize(`${record.law} ${record.article} ${record.text}`)
    const matches = keywordArray.filter((keyword) => haystack.includes(keyword))
    if (!matches.length) return null
    const confidence = Math.min(1, matches.length / keywordArray.length + 0.2)
    const snippet = record.text.slice(0, 240)
    return {
      ...record,
      snippet,
      confidence,
    }
  }).filter(Boolean) as ArticleLookupHit[]

  if (!scored.length) {
    return { status: 'not_found', results: [] }
  }

  const sorted = scored.sort((a, b) => b.confidence - a.confidence).slice(0, 3)

  return {
    status: 'found',
    results: sorted,
  }
}
