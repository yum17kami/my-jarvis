import type { SupabaseClient } from '@supabase/supabase-js'
import { createEmbedding } from '../openai/embeddings'

export async function searchRelevantMemories(
  supabase: SupabaseClient,
  userId: string,
  query: string,
  limit = 5
): Promise<string[]> {
  const embedding = await createEmbedding(query)

  const { data } = await supabase.rpc('search_memories', {
    query_embedding: embedding,
    user_id_param: userId,
    match_count: limit,
  })

  return (data || []).map((m: { category: string; content: string }) => `[${m.category}] ${m.content}`)
}
