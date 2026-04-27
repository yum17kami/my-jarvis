import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHypotheses } from '@/lib/memory/hypotheses'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hypotheses = await getHypotheses(supabase, user.id)
  return NextResponse.json({ hypotheses })
}
