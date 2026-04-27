import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const audio = formData.get('audio') as File

  if (!audio) return NextResponse.json({ error: 'No audio' }, { status: 400 })

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: audio,
    language: 'ja',
  })

  return NextResponse.json({ text: response.text })
}
