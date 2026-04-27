import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'
import { searchRelevantMemories } from '@/lib/memory/search'
import { getHypotheses, formatHypothesesForPrompt } from '@/lib/memory/hypotheses'
import { extractAndStoreMemories } from '@/lib/memory/extractor'
import { buildSystemPrompt } from '@/lib/prompts'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message, conversationId, history } = await req.json() as {
    message: string
    conversationId: string
    history: ChatMessage[]
  }

  const [memories, hypotheses] = await Promise.all([
    searchRelevantMemories(supabase, user.id, message),
    getHypotheses(supabase, user.id),
  ])

  const systemPrompt = buildSystemPrompt(memories, formatHypothesesForPrompt(hypotheses))

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-10),
    { role: 'user', content: message },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.8,
    max_tokens: 500,
  })

  const assistantMessage = response.choices[0].message.content || ''

  // Store messages and extract memories in background
  if (conversationId) {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: message,
    })

    const { data: assistantMsg } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content: assistantMessage,
    }).select('id').single()

    extractAndStoreMemories(
      supabase,
      user.id,
      message,
      assistantMessage,
      assistantMsg?.id || ''
    ).catch(console.error)
  }

  return NextResponse.json({ message: assistantMessage })
}
