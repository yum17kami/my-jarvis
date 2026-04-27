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
    <div className="min-h-screen bg-[#F5EEE5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EDE3D5] border border-[#DDD0BF] mb-2">
            <span className="text-[#9B7153] font-light text-xl tracking-widest">J</span>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-[#2A1E14]">Jarvis</h1>
          <p className="text-[#A8957E] text-sm">話すほど、あなたを理解していくAI</p>
        </div>

        {sent ? (
          <div className="text-center space-y-2 bg-[#FDFCFA] rounded-2xl p-8 border border-[#DDD0BF]">
            <p className="text-[#5C4D3D] font-medium">メールを送りました</p>
            <p className="text-[#A8957E] text-sm leading-relaxed">{email}<br />のリンクをクリックしてログイン</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full bg-[#FDFCFA] border border-[#DDD0BF] rounded-xl px-4 py-3 text-[#2A1E14] placeholder:text-[#C8B9A5] outline-none focus:border-[#9B7153] transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#9B7153] hover:bg-[#7A5740] disabled:bg-[#DDD0BF] disabled:text-[#A8957E] text-[#FDFCFA] rounded-xl py-3 text-sm font-medium transition-colors"
            >
              {loading ? '送信中...' : 'マジックリンクでログイン'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
