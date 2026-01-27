'use client'

import { cn } from '@/app/_lib/utils'
import { useTheme } from '@/context/ThemeProvider'
import { MoonIcon, SunIcon } from 'lucide-react'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex">
      <button
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
        className={cn(
          isDark
            ? 'from-neutral-200/50 to-neutral-700/75 bg-gradient-to-r backdrop-blur-sm'
            : 'bg-neutral-500/10 backdrop-blur',
          'relative inline-flex items-center justify-center h-8 w-14 cursor-pointer rounded-full transition-all duration-300 ease-in-out outline-none'
        )}
      >
        <span
          className={cn(
            isDark ? 'translate-x-3' : '-translate-x-3',
            'flex items-center justify-center size-6 p-1 transform rounded-full bg-black/25 text-white shadow transition duration-300 ease-in-out'
          )}
        >
          <span className="sr-only">
            {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          </span>
          {isDark ? (
            <MoonIcon className="size-full transition-none" aria-hidden="true" />
          ) : (
            <SunIcon className="size-full transition-none" aria-hidden="true" />
          )}
        </span>
      </button>
    </div>
  )
}

export default ThemeToggle