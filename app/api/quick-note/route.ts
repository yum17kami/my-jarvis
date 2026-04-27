import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractAndStoreMemories } from '@/lib/memory/extractor'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-widget-token')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Resolve user from widget token
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('widget_token', token)
    .single()

  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = profile.id
  const { text } = await req.json() as { text: string }

  // Ping check (setup verification)
  if (text === '__ping__') return NextResponse.json({ ok: true })

  if (!text?.trim()) return NextResponse.json({ error: 'Empty note' }, { status: 400 })

  // Find or create "Quick Notes" conversation
  let { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('title', 'Quick Notes')
    .single()

  if (!conv) {
    const { data: newConv } = await supabaseAdmin
      .from('conversations')
      .insert({ user_id: userId, title: 'Quick Notes' })
      .select('id')
      .single()
    conv = newConv
  }

  if (!conv) return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })

  // Store message
  const { data: msg } = await supabaseAdmin
    .from('messages')
    .insert({ conversation_id: conv.id, user_id: userId, role: 'user', content: text })
    .select('id')
    .single()

  // Extract memories in background
  extractAndStoreMemories(supabaseAdmin, userId, text, '', msg?.id ?? '').catch(console.error)

  return NextResponse.json({ ok: true })
}
