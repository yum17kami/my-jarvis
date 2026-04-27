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
  ])

  const stats = {
    memoryCount: memoryCount || 0,
    hypothesisCount: (hypotheses || []).length,
    conversationCount: conversationCount || 0,
  }

  return (
    <div className="min-h-screen bg-sand-100">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-sand-100/80 backdrop-blur border-b border-sand-300/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-sm text-sand-500 hover:text-sand-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            チャットに戻る
          </Link>
          <span className="text-sand-300">|</span>
          <h1 className="text-sm font-medium text-sand-700 tracking-wide">Jarvisが知っていること</h1>
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
