'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>(
    () => (searchParams.get('mode') === 'signup' ? 'signup' : 'signin')
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        setMessage('Check your email for a magic link.')
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account created! Check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-sand flex flex-col">
      <nav className="max-w-content mx-auto w-full px-6 py-8">
        <Link href="/" className="font-display text-2xl text-soil font-semibold">Grove</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl text-soil mb-2">
            {mode === 'signup' ? 'Create an account' : mode === 'magic' ? 'Magic link' : 'Welcome back'}
          </h1>
          <p className="text-bark mb-8">
            {mode === 'signup' ? 'Start knowing what you eat.' : mode === 'magic' ? "We'll email you a link to sign in." : 'Sign in to your Grove account.'}
          </p>

          <div className="bg-linen border border-stone rounded-card p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-bark mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-sand border border-stone rounded-input text-soil placeholder-stone focus:outline-none focus:border-clay transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {mode !== 'magic' && (
                <div>
                  <label className="block text-sm font-medium text-bark mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-sand border border-stone rounded-input text-soil placeholder-stone focus:outline-none focus:border-clay transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && <p className="text-rust text-sm">{error}</p>}
              {message && <p className="text-moss text-sm">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-clay text-sand font-medium rounded-input hover:bg-clay-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : mode === 'signup' ? 'Create account' : mode === 'magic' ? 'Send magic link' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone flex flex-col gap-3 text-center text-sm text-bark">
              {mode !== 'magic' && (
                <button onClick={() => setMode('magic')} className="text-clay hover:text-clay-light transition-colors">
                  Sign in with magic link instead
                </button>
              )}
              {mode === 'signin' && (
                <button onClick={() => setMode('signup')} className="text-clay hover:text-clay-light transition-colors">
                  Don&apos;t have an account? Sign up
                </button>
              )}
              {mode === 'signup' && (
                <button onClick={() => setMode('signin')} className="text-clay hover:text-clay-light transition-colors">
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'magic' && (
                <button onClick={() => setMode('signin')} className="text-clay hover:text-clay-light transition-colors">
                  Use email and password instead
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sand flex items-center justify-center"><p className="text-bark">Loading...</p></div>}>
      <AuthForm />
    </Suspense>
  )
}
