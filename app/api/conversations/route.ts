import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('conversations')
    .insert({ user_id: user.id, title: '新しい会話' })
    .select('id')
    .single()

  return NextResponse.json({ id: data?.id })
}
