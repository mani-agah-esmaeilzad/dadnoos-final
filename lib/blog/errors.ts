import { Prisma } from '@prisma/client'

export function isMissingBlogTable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021'
}
