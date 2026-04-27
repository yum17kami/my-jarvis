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
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-sky-600 text-white rounded-br-sm'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
        )}
      >
        <p className="whitespace-pre-wrap">{mainText}</p>
        {suggestion && (
          <p className="mt-2 pt-2 border-t border-zinc-700 text-sky-300 text-xs">
            💡 {suggestion}
          </p>
        )}
      </div>
    </div>
  )
}
