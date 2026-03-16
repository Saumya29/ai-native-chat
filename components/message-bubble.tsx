'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { type ChatMessage, type ChatUser } from '@/lib/types'

interface MessageBubbleProps {
  message:      ChatMessage
  user:         ChatUser
  isOwn:        boolean
  grouped?:     boolean
  highlighted?: boolean
  agentForUser?: ChatUser
  onFeedback?:  (messageId: string, type: 'up' | 'down', note?: string) => void
  feedback?:    'up' | 'down'
}

export function MessageBubble({ message, user, isOwn, grouped, highlighted, agentForUser, onFeedback, feedback }: MessageBubbleProps) {
  const isAI = message.role === 'ai'
  const isAgent = message.role === 'agent'
  const ref = useRef<HTMLDivElement>(null)
  const [flash, setFlash] = useState(false)
  const [showFeedbackInput, setShowFeedbackInput] = useState(false)
  const [feedbackNote, setFeedbackNote] = useState('')

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

  // Agent message rendering
  if (isAgent && agentForUser) {
    return (
      <div
        ref={ref}
        data-message-id={message.id}
        className={`
          flex flex-col gap-1 ml-3 md:ml-11
          ${grouped ? 'mt-1' : 'mt-3'}
          ${flash ? 'animate-pulse rounded-xl ring-2 ring-primary/30' : ''}
          transition-all duration-500
        `}
      >
        {!grouped && (
          <div className="flex items-center gap-2 px-0.5">
            <div
              title={`${agentForUser.name}'s Agent`}
              className={`
                w-5 h-5 rounded-full ${agentForUser.color} opacity-60
                flex items-center justify-center shrink-0
              `}
            >
              <span className="text-[7px] font-bold text-white leading-none tracking-tight">
                {agentForUser.initials}
              </span>
            </div>
            <span className="text-[12px] font-semibold leading-none text-muted-foreground">
              {agentForUser.name}&apos;s Agent
            </span>
            <span className="text-[9px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full leading-none">
              AGENT
            </span>
            <span className="text-[10px] text-muted-foreground/60 leading-none">{time}</span>
          </div>
        )}

        <div className="px-3 py-2 text-[13px] leading-relaxed break-words rounded-xl rounded-bl-sm bg-muted/50 border border-dashed border-border text-foreground max-w-[85%] md:max-w-[65%]">
          <span className="whitespace-pre-wrap">{message.content}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-message-id={message.id}
      className={`
        group flex items-end gap-3
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

        {/* Feedback buttons for AI messages */}
        {isAI && onFeedback && (
          <div className="flex items-center gap-1 px-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                onFeedback(message.id, 'up')
                setShowFeedbackInput(false)
              }}
              className={`p-1 rounded transition-colors ${
                feedback === 'up'
                  ? 'text-primary'
                  : feedback === 'down'
                  ? 'text-muted-foreground/30'
                  : 'text-muted-foreground/50 hover:text-primary'
              }`}
              aria-label="Thumbs up"
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => {
                if (feedback !== 'down') {
                  setShowFeedbackInput(true)
                }
              }}
              className={`p-1 rounded transition-colors ${
                feedback === 'down'
                  ? 'text-destructive'
                  : feedback === 'up'
                  ? 'text-muted-foreground/30'
                  : 'text-muted-foreground/50 hover:text-destructive'
              }`}
              aria-label="Thumbs down"
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        )}

        {/* Feedback note input */}
        {showFeedbackInput && (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={feedbackNote}
              onChange={e => setFeedbackNote(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && feedbackNote.trim()) {
                  onFeedback?.(message.id, 'down', feedbackNote.trim())
                  setFeedbackNote('')
                  setShowFeedbackInput(false)
                }
                if (e.key === 'Escape') {
                  setShowFeedbackInput(false)
                  setFeedbackNote('')
                }
              }}
              placeholder="What should change?"
              autoFocus
              className="text-[12px] px-2 py-1 rounded-lg border border-border bg-card text-foreground
                placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring/20
                w-56 transition-all"
            />
          </div>
        )}
      </div>
    </div>
  )
}
