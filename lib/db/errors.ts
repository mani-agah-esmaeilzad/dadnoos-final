import { Prisma } from '@prisma/client'

const CONNECTION_ERROR_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1009'])

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return true
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && CONNECTION_ERROR_CODES.has(error.code)) {
    return true
  }

  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : typeof error === 'string'
        ? error
        : ''

  if (!message) return false

  return (
    message.includes("Can't reach database server") ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    message.includes('connect ECONN')
  )
}
