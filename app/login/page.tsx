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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/chat` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-sand-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sand-200 border border-sand-300 mb-2">
            <span className="text-wood font-light text-xl tracking-widest">J</span>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-sand-900">Jarvis</h1>
          <p className="text-sand-500 text-sm">話すほど、あなたを理解していくAI</p>
        </div>

        {sent ? (
          <div className="text-center space-y-2 bg-sand-50 rounded-2xl p-8 border border-sand-300">
            <p className="text-sand-700 font-medium">メールを送りました</p>
            <p className="text-sand-500 text-sm leading-relaxed">{email}<br />のリンクをクリックしてログイン</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full bg-sand-50 border border-sand-300 rounded-xl px-4 py-3 text-sand-900 placeholder:text-sand-400 outline-none focus:border-wood transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-wood hover:bg-wood-dark disabled:bg-sand-300 disabled:text-sand-500 text-sand-50 rounded-xl py-3 text-sm font-medium transition-colors"
            >
              {loading ? '送信中...' : 'マジックリンクでログイン'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
