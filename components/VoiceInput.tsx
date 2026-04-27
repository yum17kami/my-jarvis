'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        setLoading(true)
        await transcribe(blob)
      }
      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error('Microphone access denied:', err)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const transcribe = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'audio.webm')
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
      const { text } = await res.json()
      if (text) onTranscript(text)
    } catch (err) {
      console.error('Transcription failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={recording ? stopRecording : startRecording}
      title={recording ? '録音を停止' : '音声で入力'}
      className={cn(
        'p-2 rounded-full transition-all flex-shrink-0',
        recording ? 'text-red-400 animate-pulse' : 'text-sand-400 hover:text-sand-600',
        loading && 'text-wood cursor-wait',
        (disabled || loading) && !recording && 'opacity-40'
      )}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> :
       recording ? <MicOff className="w-5 h-5" /> :
       <Mic className="w-5 h-5" />}
    </button>
  )
}
