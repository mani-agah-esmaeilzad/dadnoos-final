interface KpiCardProps {
  label: string
  value: number
  description?: string
}

export function KpiCard({ label, value, description }: KpiCardProps) {
  const formatted = Intl.NumberFormat('fa-IR').format(value)
  return (
    <div className="rounded-2xl border border-neutral-200/40 bg-white/60 p-5 shadow-sm backdrop-blur-md dark:bg-neutral-900/60">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-neutral-100">{formatted}</p>
      {description ? <p className="mt-2 text-xs text-neutral-500">{description}</p> : null}
    </div>
  )
}
