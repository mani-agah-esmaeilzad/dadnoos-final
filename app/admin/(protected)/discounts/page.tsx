import { DiscountManager } from '@/app/admin/_components/discount-manager'
import { listDiscountCodes } from '@/lib/admin/discounts'
import { withDbFallback } from '@/lib/db/fallback'

export const metadata = {
  title: 'مدیریت تخفیف‌ها',
}

export default async function AdminDiscountsPage() {
  const discounts = await withDbFallback(
    () => listDiscountCodes(),
    [],
    'admin-discounts'
  )
  return <DiscountManager initialDiscounts={discounts} />
}
