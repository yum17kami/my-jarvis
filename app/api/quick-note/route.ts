import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractAndStoreMemories } from '@/lib/memory/extractor'
import OpenAI from 'openai'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

  // Detect content type: audio FormData vs JSON
  let text: string
  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const audio = formData.get('audio') as File | null
    if (!audio) return NextResponse.json({ error: 'No audio' }, { status: 400 })

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audio,
      language: 'ja',
    })
    text = transcription.text
  } else {
    const body = await req.json() as { text: string }
    text = body.text
  }

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
