'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'

export default function AdminLoginForm() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.detail || 'ورود ناموفق بود.')
      }
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق بود.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-neutral-400">ایمیل سازمانی</label>
        <Input
          dir="auto"
          type="email"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="admin@dadnoos.app"
          required
        />
      </div>
      <div>
        <label className="text-sm text-neutral-400">رمز عبور</label>
        <Input
          dir="auto"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className='space-y-3'>
        <Button type="submit" className="w-full rounded-3xl" disabled={loading}>
          {loading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}
        </Button>
        <Button variant="outline" type="submit" className="w-full rounded-3xl" onClick={() => router.push("/")} disabled={loading}>
          صفحه اصلی
        </Button>
      </div>
    </form>
  )
}
