import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jarvis — AI Life Coach',
  description: 'Your personal AI that grows wiser about you through every conversation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  )
}
