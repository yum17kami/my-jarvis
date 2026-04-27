import { openai } from '../openai/client'
import { createEmbedding } from '../openai/embeddings'
import { MEMORY_EXTRACTION_PROMPT, HYPOTHESIS_UPDATE_PROMPT } from '../prompts'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function extractAndStoreMemories(
  supabase: SupabaseClient,
  userId: string,
  userMessage: string,
  assistantMessage: string,
  messageId: string
) {
  const conversationText = `ユーザー: ${userMessage}\nJarvis: ${assistantMessage}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: MEMORY_EXTRACTION_PROMPT },
      { role: 'user', content: conversationText },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const result = JSON.parse(response.choices[0].message.content || '{"memories":[]}')
  const memories: Array<{ category: string; content: string }> = result.memories || []

  if (memories.length === 0) return

  for (const memory of memories) {
    const embedding = await createEmbedding(memory.content)
    await supabase.from('memories').insert({
      user_id: userId,
      category: memory.category,
      content: memory.content,
      embedding,
      source_message_id: messageId,
    })
  }

  // After all memory inserts, enforce 300-memory cap
  const { count } = await supabase
    .from('memories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count || 0) > 300) {
    const { data: oldest } = await supabase
      .from('memories')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit((count || 0) - 300)

    if (oldest && oldest.length > 0) {
      await supabase
        .from('memories')
        .delete()
        .in('id', oldest.map((m: { id: string }) => m.id))
    }
  }

  await updateHypotheses(supabase, userId)
}

async function updateHypotheses(supabase: SupabaseClient, userId: string) {
  const { data: recentMemories } = await supabase
    .from('memories')
    .select('category, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: existingHypotheses } = await supabase
    .from('hypotheses')
    .select('category, statement, confidence')
    .eq('user_id', userId)

  const memoriesText = (recentMemories || []).map((m: { category: string; content: string }) => `[${m.category}] ${m.content}`).join('\n')
  const hypothesesText = (existingHypotheses || []).map((h: { category: string; statement: string; confidence: number }) => `[${h.category}] ${h.statement} (信頼度: ${h.confidence})`).join('\n')

  const prompt = `新しい記憶:\n${memoriesText}\n\n既存の仮説:\n${hypothesesText || 'なし'}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: HYPOTHESIS_UPDATE_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const result = JSON.parse(response.choices[0].message.content || '{"hypotheses":[]}')
  const newHypotheses: Array<{ category: string; statement: string; confidence: number }> = result.hypotheses || []

  if (newHypotheses.length === 0) return

  await supabase.from('hypotheses').delete().eq('user_id', userId)
  await supabase.from('hypotheses').insert(
    newHypotheses.map((h) => ({
      user_id: userId,
      category: h.category,
      statement: h.statement,
      confidence: h.confidence,
    }))
  )
}
