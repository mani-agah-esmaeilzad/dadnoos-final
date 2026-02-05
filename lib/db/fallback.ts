import { isDatabaseUnavailableError } from '@/lib/db/errors'

export async function withDbFallback<T>(loader: () => Promise<T>, fallbackValue: T, label?: string): Promise<T> {
  try {
    return await loader()
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[db-fallback] Using fallback for ${label ?? loader.name ?? 'loader'}: ${message}`)
      return fallbackValue
    }
    throw error
  }
}
