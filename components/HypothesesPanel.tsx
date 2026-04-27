'use client'

import { useState, useEffect } from 'react'
import { Brain, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Hypothesis {
  category: string
  statement: string
  confidence: number
}

export function HypothesesPanel() {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/hypotheses')
        if (res.ok) {
          const data = await res.json()
          setHypotheses(data.hypotheses || [])
        }
      } catch {}
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full bg-zinc-900/95 backdrop-blur border-l border-zinc-800 transition-all duration-300 flex flex-col z-10',
        open ? 'w-72' : 'w-11'
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-4 text-zinc-400 hover:text-zinc-200 transition-colors min-h-[56px]"
        title={open ? 'パネルを閉じる' : 'Jarvisの理解を見る'}
      >
        <Brain className="w-5 h-5 flex-shrink-0" />
        {open && (
          <>
            <span className="text-sm font-medium whitespace-nowrap">Jarvisの理解</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </>
        )}
        {!open && hypotheses.length > 0 && (
          <span className="absolute right-1 top-3 w-2 h-2 bg-sky-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
          {hypotheses.length === 0 ? (
            <p className="text-zinc-600 text-xs leading-relaxed mt-2">
              会話を重ねると、ここにあなたへの理解が積み上がります
            </p>
          ) : (
            hypotheses.map((h, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-sky-400">{h.category}</span>
                  <span className="text-xs text-zinc-600">{Math.round(h.confidence * 100)}%</span>
                </div>
                <div className="relative h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${h.confidence * 100}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{h.statement}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
