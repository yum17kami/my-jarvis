'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

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
      setMessages((prev) => [...prev, { role: 'assistant', content: 'ちょっと待ってて。もう一度試してみて。' }])
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
    <div className="flex h-screen bg-[#F5EEE5]">
      <div className="flex-1 flex flex-col min-w-0 pr-11">

        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-[#DDD0BF]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#EDE3D5] border border-[#DDD0BF] flex items-center justify-center flex-shrink-0">
              <span className="text-[#9B7153] font-light text-sm tracking-widest">J</span>
            </div>
            <div>
              <h1 className="text-sm font-medium text-[#2A1E14]">Jarvis</h1>
              <p className="text-xs text-[#A8957E]">AIライフコーチ</p>
            </div>
          </div>
          <Link
            href="/memories"
            className="flex items-center gap-1.5 text-xs text-[#A8957E] hover:text-[#9B7153] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#EDE3D5]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            記憶を見る
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} role={msg.role} content={msg.content} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#FDFCFA] border border-[#DDD0BF] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-[#C8B9A5] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-[#C8B9A5] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-[#C8B9A5] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-[#DDD0BF]/60">
          <div className="flex items-end gap-2 bg-[#FDFCFA] rounded-2xl px-3 py-2 border border-[#DDD0BF]">
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
              className="flex-1 bg-transparent resize-none outline-none text-sm text-[#2A1E14] placeholder:text-[#C8B9A5] py-1.5 max-h-[120px] leading-relaxed"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className={cn(
                'p-2 rounded-full transition-colors flex-shrink-0',
                input.trim() && !loading ? 'text-[#9B7153] hover:text-[#7A5740]' : 'text-[#DDD0BF]'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#C8B9A5] mt-2 text-center">
            Enter で送信 · Shift+Enter で改行
          </p>
        </div>
      </div>

      <HypothesesPanel />
    </div>
  )
}
