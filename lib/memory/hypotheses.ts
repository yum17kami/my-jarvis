import type { SupabaseClient } from '@supabase/supabase-js'

export async function getHypotheses(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('hypotheses')
    .select('category, statement, confidence')
    .eq('user_id', userId)
    .order('confidence', { ascending: false })

  return (data || []) as Array<{ category: string; statement: string; confidence: number }>
}

export function formatHypothesesForPrompt(
  hypotheses: Array<{ category: string; statement: string; confidence: number }>
): string[] {
  return hypotheses.map((h) => `[${h.category}|${Math.round(h.confidence * 100)}%] ${h.statement}`)
}
