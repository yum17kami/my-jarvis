import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jarvis',
  description: 'Your personal AI life coach',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-sand-100 text-sand-900 antialiased">{children}</body>
    </html>
  )
}
