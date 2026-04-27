'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { VoiceInput } from './VoiceInput'
import { HypothesesPanel } from './HypothesesPanel'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const initConversation = async () => {
      const res = await fetch('/api/conversations', { method: 'POST' })
      const { id } = await res.json()
      setConversationId(id)
      setMessages([{ role: 'assistant', content: 'やあ。今日どんな感じ？' }])
    }
    initConversation()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId, history }),
      })
      const { message } = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: message }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'ちょっと待ってて。もう一度試してみて。' },
      ])
    } finally {
      setLoading(false)
    }
  }, [loading, messages, conversationId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <div className="flex-1 flex flex-col min-w-0 pr-11">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100">Jarvis</h1>
              <p className="text-xs text-zinc-600">AIライフコーチ</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} role={msg.role} content={msg.content} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-zinc-800/60">
          <div className="flex items-end gap-2 bg-zinc-900 rounded-2xl px-3 py-2 border border-zinc-800">
            <VoiceInput
              onTranscript={(text) => {
                setInput((prev) => prev + (prev ? ' ' : '') + text)
                textareaRef.current?.focus()
              }}
              disabled={loading}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="何でも話しかけて..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-zinc-100 placeholder:text-zinc-600 py-1.5 max-h-[120px] leading-relaxed"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className={cn(
                'p-2 rounded-full transition-colors flex-shrink-0',
                input.trim() && !loading
                  ? 'text-sky-400 hover:text-sky-300'
                  : 'text-zinc-700'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-700 mt-2 text-center">
            Enter で送信 · Shift+Enter で改行 · マイクで音声入力
          </p>
        </div>
      </div>

      <HypothesesPanel />
    </div>
  )
}
