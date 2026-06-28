import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grove — Know what you eat.',
  description: 'A calm, minimal nutritional tracker.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
