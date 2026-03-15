'use client'

import { type ChatMessage, type ChatUser, AI_USER } from '@/lib/types'

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
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
      {/* Avatar */}
      {!grouped ? (
        <div
          className={`w-7 h-7 rounded-full ${user.color} flex items-center justify-center shrink-0`}
          aria-label={user.name}
        >
          <span className="text-[10px] font-semibold text-white">{user.initials}</span>
        </div>
      ) : (
        <div className="w-7 shrink-0" />
      )}

      {/* Bubble */}
      <div className={`flex flex-col gap-0.5 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!grouped && (
          <div className={`flex items-baseline gap-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-medium text-foreground">{isAI ? 'Mesh' : user.name}</span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
        )}
        <div
          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isAI
              ? 'bg-mesh-ai-bg text-mesh-ai-fg rounded-bl-sm'
              : isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-secondary text-secondary-foreground rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
