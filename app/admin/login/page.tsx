import { redirect } from 'next/navigation'

import AdminLoginForm from '@/app/admin/login/login-form'
import { getOptionalAdmin } from '@/lib/admin/server'

export const metadata = {
  title: 'ورود مدیر سیستم',
}

export default async function AdminLoginPage() {
  const admin = await getOptionalAdmin()
  if (admin) {
    redirect('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm text-neutral-400">Dadnoos Control Room</p>
          <h1 className="text-3xl font-semibold">ورود مدیر سیستم</h1>
          <p className="text-sm text-neutral-400">برای ادامه، ایمیل سازمانی و رمز عبور خود را وارد کنید.</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
