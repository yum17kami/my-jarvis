import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'
  const parts = content.split('💡 ')
  const mainText = parts[0].trim()
  const suggestion = parts[1]?.trim()

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-[#2A1E14] text-[#FDFCFA] rounded-br-sm'
          : 'bg-[#FDFCFA] text-[#2A1E14] rounded-bl-sm border border-[#DDD0BF] shadow-sm'
      )}>
        <p className="whitespace-pre-wrap">{mainText}</p>
        {suggestion && (
          <p className={cn(
            'mt-2 pt-2 text-xs border-t',
            isUser ? 'border-[#5C4D3D] text-[#C8B9A5]' : 'border-[#DDD0BF] text-[#9B7153]'
          )}>
            💡 {suggestion}
          </p>
        )}
      </div>
    </div>
  )
}
