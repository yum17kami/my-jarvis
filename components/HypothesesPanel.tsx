'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'
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
    <div className={cn(
      'fixed right-0 top-0 h-full bg-[#FDFCFA] border-l border-[#DDD0BF] transition-all duration-300 flex flex-col z-10',
      open ? 'w-72' : 'w-11'
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-4 text-[#A8957E] hover:text-[#5C4D3D] transition-colors min-h-[56px] relative"
        title={open ? 'パネルを閉じる' : 'Jarvisの理解を見る'}
      >
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        {open && (
          <>
            <span className="text-xs font-medium text-[#7A6A58] whitespace-nowrap tracking-wide">Jarvisの理解</span>
            <ChevronLeft className="w-4 h-4 ml-auto text-[#C8B9A5]" />
          </>
        )}
        {!open && hypotheses.length > 0 && (
          <span className="absolute right-2 top-3.5 w-1.5 h-1.5 bg-[#9B7153] rounded-full" />
        )}
      </button>

      {open && (
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">
          {hypotheses.length === 0 ? (
            <p className="text-[#C8B9A5] text-xs leading-relaxed mt-1">
              会話を重ねると、ここにあなたへの理解が積み上がります
            </p>
          ) : (
            hypotheses.map((h, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#9B7153]">{h.category}</span>
                  <span className="text-xs text-[#C8B9A5]">{Math.round(h.confidence * 100)}%</span>
                </div>
                <div className="relative h-0.5 bg-[#EDE3D5] rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#9B7153] rounded-full transition-all duration-700"
                    style={{ width: `${h.confidence * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#7A6A58] leading-relaxed">{h.statement}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
