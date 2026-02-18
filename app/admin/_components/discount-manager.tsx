'use client'

import { useState, useTransition } from 'react'
import { Trash2, RefreshCcw } from 'lucide-react'

import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { Textarea } from '@/app/_ui/components/textarea'

export interface DiscountRecord {
  id: string
  code: string
  description?: string | null
  percentage: number
  max_redemptions?: number | null
  redemptions_count?: number
  expires_at?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface DiscountManagerProps {
  initialDiscounts: DiscountRecord[]
}

export function DiscountManager({ initialDiscounts }: DiscountManagerProps) {
  const [discounts, setDiscounts] = useState<DiscountRecord[]>(initialDiscounts)
  const [form, setForm] = useState({
    code: '',
    description: '',
    percentage: 10,
    maxRedemptions: '',
    expiresAt: '',
  })
  const [isCreating, startCreating] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [refreshing, startRefreshing] = useTransition()

  const refreshList = () => {
    startRefreshing(async () => {
      const res = await fetch('/api/admin/discounts', { cache: 'no-store' })
      const data = await res.json().catch(() => ({ discounts: [] }))
      setDiscounts(data.discounts ?? [])
    })
  }

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startCreating(async () => {
      try {
        const payload = {
          code: form.code,
          description: form.description || undefined,
          percentage: form.percentage,
          max_redemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
          expires_at: form.expiresAt || undefined,
        }
        const res = await fetch('/api/admin/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}))
          throw new Error(detail.detail || 'ایجاد کد تخفیف ناموفق بود.')
        }
        setForm({
          code: '',
          description: '',
          percentage: 10,
          maxRedemptions: '',
          expiresAt: '',
        })
        refreshList()
      } catch (error) {
        console.error(error)
        alert(error instanceof Error ? error.message : 'خطای ناشناخته')
      }
    })
  }

  const handleToggle = async (discount: DiscountRecord, nextActive: boolean) => {
    setBusyId(discount.id)
    try {
      const res = await fetch(`/api/admin/discounts/${discount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail || 'به‌روزرسانی وضعیت انجام نشد.')
      }
      refreshList()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'خطای ناشناخته')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کد تخفیف مطمئن هستید؟')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail || 'حذف کد تخفیف انجام نشد.')
      }
      refreshList()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'خطای ناشناخته')
    } finally {
      setBusyId(null)
    }
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleString('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return value
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className='space-y-2'>
          <p className="text-sm text-neutral-400">کدهای قابل ارائه به کاربران</p>
          <h1 className="text-3xl font-semibold">مدیریت تخفیف‌ها</h1>
        </div>
        <Button
          variant="ghost"
          className="gap-2"
          onClick={refreshList}
          disabled={refreshing}
        >
          <RefreshCcw className="size-4" />
          بروزرسانی
        </Button>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-3xl border border-neutral-200/60 p-6 shadow-sm dark:border-neutral-800"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-neutral-500">کد</label>
            <Input
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="مثال: DADNOOS25"
              required
            />
          </div>
          <div>
            <label className="text-sm text-neutral-500">درصد تخفیف</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.percentage}
              onChange={(event) => setForm((prev) => ({ ...prev, percentage: Number(event.target.value) }))}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-500">حداکثر استفاده</label>
            <Input
              type="number"
              placeholder="نامحدود"
              value={form.maxRedemptions}
              onChange={(event) => setForm((prev) => ({ ...prev, maxRedemptions: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-500">تاریخ انقضا</label>
            <Input
              className='h-10 max-w-[calc(100%-18px)]'
              type="date"
              value={form.expiresAt}
              onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-neutral-500">توضیحات</label>
          <Textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="شرایط استفاده، پلن هدف و ..."
            className="min-h-[80px]"
          />
        </div>
        <div className="flex justify-start">
          <Button type="submit" className="px-8 rounded-full" disabled={isCreating}>
            ثبت کد جدید
          </Button>
        </div>
      </form>

      <div className="rounded-3xl border border-neutral-200/60 shadow-sm dark:border-neutral-800 overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-neutral-400/25 text-sm">
          <thead className="bg-neutral-50/60 text-neutral-500 dark:bg-neutral-900/60">
            <tr>
              <th className="px-4 py-4 text-right font-medium whitespace-nowrap">کد</th>
              <th className="px-4 py-4 text-right font-medium whitespace-nowrap">درصد</th>
              <th className="px-4 py-4 text-right font-medium whitespace-nowrap">استفاده شده</th>
              <th className="px-4 py-4 text-right font-medium whitespace-nowrap">انقضا</th>
              <th className="px-4 py-4 text-right font-medium whitespace-nowrap">وضعیت</th>
              <th className="px-4 py-4 text-right font-medium whitespace-nowrap">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100/60 bg-white/80 dark:divide-neutral-800/80 dark:bg-neutral-900/40">
            {discounts.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-neutral-500" colSpan={6}>
                  تا کنون کدی ثبت نشده است.
                </td>
              </tr>
            )}
            {discounts.map((discount) => (
              <tr key={discount.id}>
                <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                  {discount.code}
                  {discount.description && (
                    <p className="text-xs text-neutral-500">{discount.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">
                  {discount.percentage}٪
                </td>
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-200">
                  {discount.redemptions_count ?? 0}
                  {discount.max_redemptions ? ` / ${discount.max_redemptions}` : ' / ∞'}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {formatDate(discount.expires_at)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${discount.is_active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-neutral-200 text-neutral-600'
                      }`}
                  >
                    {discount.is_active ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    disabled={busyId === discount.id}
                    onClick={() => handleToggle(discount, !discount.is_active)}
                  >
                    {discount.is_active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    disabled={busyId === discount.id}
                    onClick={() => handleDelete(discount.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
