'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Memory {
  id: string
  category: string
  content: string
  importance: number
  mention_count: number
  created_at: string
}

interface Hypothesis {
  category: string
  statement: string
  confidence: number
}

interface Stats {
  memoryCount: number
  hypothesisCount: number
  conversationCount: number
}

interface MemoriesViewProps {
  memories: Memory[]
  hypotheses: Hypothesis[]
  stats: Stats
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  fact:       { label: '事実',   color: 'bg-amber-100 text-amber-800 border-amber-200' },
  value:      { label: '価値観', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  pattern:    { label: 'パターン', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  goal:       { label: '目標',   color: 'bg-purple-100 text-purple-800 border-purple-200' },
  preference: { label: '好み',   color: 'bg-rose-100 text-rose-800 border-rose-200' },
  emotion:    { label: '感情',   color: 'bg-orange-100 text-orange-800 border-orange-200' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}日前`
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export function MemoriesView({ memories, hypotheses, stats }: MemoriesViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)]
  const filtered = activeCategory === 'all'
    ? memories
    : memories.filter((m) => m.category === activeCategory)

  return (
    <div className="min-h-screen bg-sand-100">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: stats.memoryCount, label: '件の記憶' },
            { value: stats.hypothesisCount, label: '個の仮説' },
            { value: stats.conversationCount, label: '回の会話' },
          ].map((s, i) => (
            <div key={i} className="bg-sand-50 border border-sand-300 rounded-2xl px-6 py-5 text-center">
              <div className="text-3xl font-light text-sand-900">{s.value}</div>
              <div className="text-xs text-sand-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hypotheses */}
        {hypotheses.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-medium text-sand-500 uppercase tracking-widest">Jarvisの理解</h2>
            <div className="grid gap-3">
              {hypotheses.map((h, i) => (
                <div key={i} className="bg-sand-50 border border-sand-300 rounded-2xl px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="text-xs font-medium text-wood">{h.category}</span>
                    <span className="text-xs text-sand-400 flex-shrink-0">{Math.round(h.confidence * 100)}%</span>
                  </div>
                  <div className="relative h-0.5 bg-sand-200 rounded-full overflow-hidden mb-3">
                    <div
                      className="absolute inset-y-0 left-0 bg-wood rounded-full"
                      style={{ width: `${h.confidence * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-sand-700 leading-relaxed">{h.statement}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Memories */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium text-sand-500 uppercase tracking-widest">記憶</h2>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-colors',
                  activeCategory === cat
                    ? 'bg-sand-900 text-sand-50 border-sand-900'
                    : 'bg-sand-50 text-sand-600 border-sand-300 hover:border-sand-500'
                )}
              >
                {cat === 'all' ? 'すべて' : CATEGORY_LABELS[cat]?.label}
                {cat === 'all'
                  ? ` (${memories.length})`
                  : ` (${memories.filter((m) => m.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Memory cards */}
          {filtered.length === 0 ? (
            <p className="text-sand-400 text-sm text-center py-12">
              まだ記憶がありません。会話を始めてみてください。
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((memory) => {
                const cat = CATEGORY_LABELS[memory.category]
                return (
                  <div
                    key={memory.id}
                    className="bg-sand-50 border border-sand-300 rounded-2xl px-5 py-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', cat?.color ?? 'bg-sand-200 text-sand-600 border-sand-300')}>
                        {cat?.label ?? memory.category}
                      </span>
                      <span className="text-xs text-sand-400 flex-shrink-0">{formatDate(memory.created_at)}</span>
                    </div>
                    <p className="text-sm text-sand-800 leading-relaxed">{memory.content}</p>
                    {memory.mention_count > 1 && (
                      <p className="text-xs text-sand-400">{memory.mention_count}回言及</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
