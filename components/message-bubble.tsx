'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { type ChatMessage, type ChatUser } from '@/lib/types'

interface MessageBubbleProps {
  message:      ChatMessage
  user:         ChatUser
  isOwn:        boolean
  grouped?:     boolean
  highlighted?: boolean
}

export function MessageBubble({ message, user, isOwn, grouped, highlighted }: MessageBubbleProps) {
  const isAI = message.role === 'ai'
  const ref = useRef<HTMLDivElement>(null)
  const [flash, setFlash] = useState(false)

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit',
  })

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [highlighted])

  return (
    <div
      ref={ref}
      data-message-id={message.id}
      className={`
        flex items-end gap-3
        ${isOwn ? 'flex-row-reverse' : 'flex-row'}
        ${grouped ? 'mt-1' : 'mt-5'}
        ${flash ? 'animate-pulse rounded-xl ring-2 ring-primary/30' : ''}
        transition-all duration-500
      `}
    >
      {/* Avatar */}
      {!grouped ? (
        <div
          title={user.name}
          className={`
            w-8 h-8 rounded-full ${user.color}
            flex items-center justify-center shrink-0
            shadow-sm
          `}
        >
          <span className="text-[10px] font-bold text-white leading-none tracking-tight">
            {user.initials}
          </span>
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      {/* Bubble + meta */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!grouped && (
          <div className={`flex items-baseline gap-2 px-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className={`text-[13px] font-semibold leading-none ${isAI ? 'text-primary' : 'text-foreground'}`}>
              {isAI ? 'Mesh' : user.name}
            </span>
            {isAI && (
              <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full leading-none">
                AI
              </span>
            )}
            {!isAI && (
              <span className="text-[11px] text-muted-foreground leading-none">{user.role}</span>
            )}
            <span className="text-[11px] text-muted-foreground/60 leading-none">{time}</span>
          </div>
        )}

        <div
          className={`
            px-4 py-3 text-[13.5px] leading-relaxed break-words
            ${isAI
              ? 'rounded-2xl rounded-bl-sm bg-card border border-primary/15 text-foreground shadow-sm'
              : isOwn
              ? 'rounded-2xl rounded-br-sm bg-primary text-primary-foreground shadow-sm'
              : 'rounded-2xl rounded-bl-sm bg-card border border-border text-foreground shadow-sm'
            }
          `}
        >
          {isAI ? (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-foreground prose-headings:text-foreground prose-headings:text-sm prose-headings:mt-2 prose-headings:mb-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>
      </div>
    </div>
  )
}
