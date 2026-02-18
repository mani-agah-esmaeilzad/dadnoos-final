export function calculateMessageBasedCredit({
  planPriceCents,
  messageQuota,
  messagesUsed,
}: {
  planPriceCents: number
  messageQuota: number
  messagesUsed: number
}) {
  const price = Math.max(planPriceCents, 0)
  const quota = Math.max(messageQuota, 0)
  if (!price || !quota) return 0
  const used = Math.max(messagesUsed, 0)
  const remaining = Math.max(quota - used, 0)
  const ratio = Math.min(remaining / quota, 1)
  return Math.round(price * ratio)
}
