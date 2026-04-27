'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/chat` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-600 mb-4">
            <span className="text-white font-bold text-lg">J</span>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100">Jarvis</h1>
          <p className="mt-1 text-zinc-500 text-sm">あなたのAIライフコーチ</p>
        </div>

        {sent ? (
          <div className="text-center space-y-2 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <p className="text-zinc-200 font-medium">メールを送りました</p>
            <p className="text-zinc-500 text-sm">{email} のリンクをクリックしてログイン</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-sky-500 transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl py-3 text-sm font-medium transition-colors"
            >
              {loading ? '送信中...' : 'マジックリンクでログイン'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-zinc-600">
          話すほど、あなたを理解していくAIです
        </p>
      </div>
    </div>
  )
}
