interface KpiCardProps {
  label: string
  value: number
  description?: string
}

export function KpiCard({ label, value, description }: KpiCardProps) {
  const formatted = Intl.NumberFormat('fa-IR').format(value)
  return (
    <div className="rounded-3xl border border-neutral-400/25 bg-white/60 p-6 shadow-sm backdrop-blur-md dark:bg-neutral-900/60">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{formatted}</p>
      {description ? <p className="mt-2 text-xs text-neutral-400">{description}</p> : null}
    </div>
  )
}
