'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'

interface UserActionsProps {
  userId: string
  status: string
  monthlyQuota: number
}

function formatNumber(value: number) {
  return value.toLocaleString('fa-IR')
}

function useActionState() {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  return { message, setMessage, isPending, startTransition }
}

export default function UserActions({ userId, status, monthlyQuota }: UserActionsProps) {
  const router = useRouter()
  const [quotaOpen, setQuotaOpen] = useState(false)
  const [quotaValue, setQuotaValue] = useState<number>(monthlyQuota)
  const [statusPending, startStatusTransition] = useTransition()
  const { message, setMessage, isPending, startTransition } = useActionState()

  const toggleStatus = () => {
    const nextStatus = status === 'active' ? 'disabled' : 'active'
    startStatusTransition(async () => {
      setMessage(null)
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setMessage(payload.detail || 'خطا در به‌روزرسانی وضعیت.')
        return
      }
      router.refresh()
    })
  }

  const submitQuota = () => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}/quota`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyQuota: quotaValue }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setMessage(payload.detail || 'خطا در به‌روزرسانی سهمیه.')
        return
      }
      setMessage('سهمیه ذخیره شد.')
      setQuotaOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2 text-xs text-neutral-500">
      <div className="flex flex-wrap gap-2">
        {quotaOpen ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={quotaValue}
              className="w-32"
              onChange={(event) => setQuotaValue(Number(event.target.value))}
            />
            <Button size="sm" disabled={isPending} onClick={submitQuota}>
              ذخیره
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setQuotaOpen(false)}>
              انصراف
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setQuotaOpen(true)}>
            ویرایش سهمیه ({formatNumber(monthlyQuota)})
          </Button>
        )}
        <Button
          size="sm"
          variant={status === 'active' ? 'outline' : 'default'}
          disabled={statusPending}
          onClick={toggleStatus}
        >
          {status === 'active' ? 'تعلیق کاربر' : 'فعال‌سازی کاربر'}
        </Button>
      </div>
      {message && <p className="text-xs text-red-500">{message}</p>}
    </div>
  )
}
