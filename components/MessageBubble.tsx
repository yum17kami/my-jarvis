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
          ? 'bg-sand-900 text-sand-50 rounded-br-sm'
          : 'bg-sand-50 text-sand-900 rounded-bl-sm border border-sand-300 shadow-sm'
      )}>
        <p className="whitespace-pre-wrap">{mainText}</p>
        {suggestion && (
          <p className={cn(
            'mt-2 pt-2 text-xs border-t',
            isUser ? 'border-sand-700 text-sand-400' : 'border-sand-300 text-wood'
          )}>
            💡 {suggestion}
          </p>
        )}
      </div>
    </div>
  )
}
