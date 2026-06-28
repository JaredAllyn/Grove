'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/trends', label: 'Trends', icon: '↗' },
  { href: '/profile', label: 'Profile', icon: '◉' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-sand flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-stone bg-linen">
        <div className="px-6 py-8">
          <Link href="/dashboard" className="font-display text-2xl text-soil font-semibold">
            Grove
          </Link>
        </div>
        <nav className="flex-1 px-3">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-input text-sm transition-colors mb-1',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-clay/10 text-clay font-medium'
                  : 'text-bark hover:text-soil hover:bg-stone/30'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 pb-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-input text-sm text-bark hover:text-rust transition-colors"
          >
            <span>⇠</span> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-stone bg-linen">
          <span className="font-display text-xl text-soil font-semibold">Grove</span>
          <nav className="flex gap-4">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors',
                  pathname === item.href ? 'text-clay font-medium' : 'text-bark'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
