export const isBuildTime =
  typeof process !== 'undefined' &&
  process.env.VERCEL === '1' &&
  process.env.NEXT_PHASE === 'phase-production-build'
