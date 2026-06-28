import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-sand flex flex-col">
      <nav className="max-w-content mx-auto w-full px-6 md:px-10 py-8 flex items-center justify-between">
        <span className="font-display text-2xl text-soil font-semibold">Grove</span>
        <div className="flex gap-3">
          <Link
            href="/auth"
            className="px-4 py-2 text-sm font-medium text-bark border border-stone rounded-input hover:border-clay transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth?mode=signup"
            className="px-4 py-2 text-sm font-medium text-sand bg-clay rounded-input hover:bg-clay-light transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center px-6 md:px-10">
        <div className="max-w-2xl text-center">
          <h1 className="font-display text-5xl md:text-7xl text-soil mb-6 leading-tight">
            Know what<br />you eat.
          </h1>
          <p className="text-bark text-lg md:text-xl mb-10 leading-relaxed">
            Grove is a calm, minimal nutrition tracker. Log meals, understand your nutrients, and let AI help fill in the gaps.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-block px-8 py-4 text-base font-medium text-sand bg-clay rounded-input hover:bg-clay-light transition-colors"
          >
            Start tracking — it&apos;s free
          </Link>
        </div>
      </section>

      <footer className="max-w-content mx-auto w-full px-6 md:px-10 py-8 text-center">
        <p className="text-stone text-sm">Grove · Simple nutrition, honestly.</p>
      </footer>
    </main>
  )
}
