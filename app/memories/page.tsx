import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MemoriesView } from '@/components/MemoriesView'

export default async function MemoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: memories },
    { data: hypotheses },
    { count: conversationCount },
    { count: memoryCount },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('memories')
      .select('id, category, content, importance, tags, mention_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(300),
    supabase
      .from('hypotheses')
      .select('category, statement, confidence')
      .eq('user_id', user.id)
      .order('confidence', { ascending: false }),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('profiles')
      .select('widget_token')
      .eq('id', user.id)
      .single(),
  ])

  const stats = {
    memoryCount: memoryCount || 0,
    hypothesisCount: (hypotheses || []).length,
    conversationCount: conversationCount || 0,
  }

  return (
    <div className="min-h-screen bg-[#F5EEE5]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-[#F5EEE5]/80 backdrop-blur border-b border-[#DDD0BF]/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-sm text-[#A8957E] hover:text-[#2A1E14] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            チャットに戻る
          </Link>
          <span className="text-[#DDD0BF]">|</span>
          <h1 className="text-sm font-medium text-[#5C4D3D] tracking-wide">Jarvisが知っていること</h1>
        </div>
      </div>

      {/* Widget token */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="bg-[#FDFCFA] border border-[#DDD0BF] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#9B7153] mb-0.5">ウィジェットトークン</p>
            <p className="text-xs text-[#A8957E]">デスクトップウィジェットの初回接続時に貼り付けてください</p>
          </div>
          <code className="text-xs font-mono bg-[#EDE3D5] text-[#5C4D3D] px-3 py-1.5 rounded-lg select-all flex-shrink-0">
            {profile?.widget_token ?? '—'}
          </code>
        </div>
      </div>

      <MemoriesView
        memories={(memories || []) as any}
        hypotheses={hypotheses || []}
        stats={stats}
      />
    </div>
  )
}
