import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  return NextResponse.json({
    memories: memories || [],
    hypotheses: hypotheses || [],
    stats: {
      memoryCount: memoryCount || 0,
      hypothesisCount: (hypotheses || []).length,
      conversationCount: conversationCount || 0,
    },
  })
}
