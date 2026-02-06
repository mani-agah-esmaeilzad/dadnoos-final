'use client'

import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/_ui/components/card'

interface DashboardChartsProps {
  messagesPerDay: { date: string; count: number }[]
  topUsers: { userId: string; username: string; totalMessages: number }[]
  moduleDistribution: { module: string; totalTokens: number }[]
}

const CHART_COLORS = ['#C8A175', '#4C6EF5', '#12B886', '#F59F00', '#845EF7', '#FF6B6B', '#63E6BE']

function formatNumber(value: number) {
  return value.toLocaleString('fa-IR')
}

export default function DashboardCharts({ messagesPerDay, topUsers, moduleDistribution }: DashboardChartsProps) {
  const sanitizedModules = moduleDistribution.slice(0, 6)
  const recentDays = [...messagesPerDay]
    .slice(-7)
    .reverse()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>روند پیام‌ها</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {messagesPerDay.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messagesPerDay}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatNumber} width={60} />
                <Tooltip formatter={(value) => formatNumber(typeof value === 'number' ? value : Number(value ?? 0))} />
                <Line type="monotone" dataKey="count" stroke="#4C6EF5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-neutral-500">داده‌ای برای نمایش وجود ندارد.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>کاربران پرترافیک</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {topUsers.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topUsers}>
                <XAxis dataKey="username" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatNumber} width={70} />
                <Tooltip formatter={(value) => formatNumber(typeof value === 'number' ? value : Number(value ?? 0))} />
                <Bar dataKey="totalMessages" fill="#12B886">
                  {topUsers.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-neutral-500">کاربری برای نمایش وجود ندارد.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>توزیع ماژول‌ها (توکن)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {sanitizedModules.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sanitizedModules}
                  dataKey="totalTokens"
                  nameKey="module"
                  outerRadius="80%"
                  innerRadius="50%"
                  paddingAngle={2}
                >
                  {sanitizedModules.map((_, index) => (
                    <Cell key={`slice-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(typeof value === 'number' ? value : Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-neutral-500">توزیع ماژولی ثبت نشده است.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>۷ روز اخیر (تعداد پیام)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {recentDays.length ? (
            <ul className="space-y-3 text-sm">
              {recentDays.map((day) => (
                <li key={day.date} className="flex items-center justify-between rounded-2xl border border-neutral-200/70 px-3 py-2 dark:border-neutral-800/70">
                  <span className="text-neutral-500">{day.date}</span>
                  <span className="font-semibold">{formatNumber(day.count)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">داده‌ای ثبت نشده است.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
