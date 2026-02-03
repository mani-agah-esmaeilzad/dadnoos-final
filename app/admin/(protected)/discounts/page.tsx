import { DiscountManager } from '@/app/admin/_components/discount-manager'
import { listDiscountCodes } from '@/lib/admin/discounts'

export const metadata = {
  title: 'مدیریت تخفیف‌ها',
}

export default async function AdminDiscountsPage() {
  const discounts = await listDiscountCodes()
  return <DiscountManager initialDiscounts={discounts} />
}
