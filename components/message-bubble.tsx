'use client'

import { type ChatMessage, type ChatUser } from '@/lib/types'

interface MessageBubbleProps {
  message: ChatMessage
  user: ChatUser
  isOwn: boolean
  grouped?: boolean
}

export function MessageBubble({ message, user, isOwn, grouped }: MessageBubbleProps) {
  const isAI = message.role === 'ai'

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex items-start gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${grouped ? 'mt-0.5' : 'mt-4'}`}>
      {/* Avatar */}
      {!grouped ? (
        <div
          className={`w-7 h-7 rounded-full ${user.color} flex items-center justify-center shrink-0 mt-0.5`}
          aria-label={user.name}
        >
          <span className="text-[10px] font-bold text-white leading-none">{user.initials}</span>
        </div>
      ) : (
        <div className="w-7 shrink-0" />
      )}

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!grouped && (
          <div className={`flex items-center gap-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className={`text-xs font-semibold ${isAI ? 'text-primary' : 'text-foreground'}`}>
              {isAI ? 'Mesh' : user.name}
              {isAI && (
                <span className="ml-1.5 text-[10px] font-medium text-primary/60 bg-primary/8 px-1.5 py-0.5 rounded-full align-middle">AI</span>
              )}
            </span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
        )}
        <div
          className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isAI
              ? 'rounded-2xl rounded-tl-sm bg-primary/[0.06] text-foreground border border-primary/10'
              : isOwn
              ? 'rounded-2xl rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-2xl rounded-tl-sm bg-secondary text-secondary-foreground'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
