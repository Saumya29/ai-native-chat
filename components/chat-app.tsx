'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, ChevronDown } from 'lucide-react'
import { DEMO_USERS, AI_USER, type ChatMessage, type ChatUser, type ContextItem } from '@/lib/types'
import { UserSwitcher } from './user-switcher'
import { MessageBubble } from './message-bubble'
import { ContextSidebar } from './context-sidebar'

let msgId = 0
const nextId = () => `msg-${++msgId}`

export function ChatApp() {
  const [activeUser, setActiveUser] = useState<ChatUser>(DEMO_USERS[0])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      role: 'ai',
      content: "Hey everyone! I'm Mesh, your AI collaborator. I'll help keep track of decisions, tasks, and anything important as we chat. What are we working on today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [contextItems, setContextItems] = useState<ContextItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addContextItems = useCallback((items: ContextItem[]) => {
    if (items.length === 0) return
    setContextItems(prev => {
      const existingTexts = new Set(prev.map(i => i.text.toLowerCase()))
      const newOnes = items.filter(i => !existingTexts.has(i.text.toLowerCase()))
      return newOnes.length > 0 ? [...prev, ...newOnes] : prev
    })
  }, [])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: nextId(),
      role: 'user',
      userId: activeUser.id,
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.role === 'user' ? `[${DEMO_USERS.find(u => u.id === m.userId)?.name ?? 'User'}]: ${m.content}` : m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()

      const aiMsg: ChatMessage = {
        id: nextId(),
        role: 'ai',
        content: data.content,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])

      if (data.contextItems?.length) {
        addContextItems(data.contextItems.map((i: Omit<ContextItem, 'addedAt'>) => ({
          ...i,
          addedAt: new Date(),
        })))
        if (!sidebarOpen) setSidebarOpen(true)
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: nextId(),
          role: 'ai',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight text-foreground">mesh</span>
          <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">demo</span>
        </div>
        <div className="flex items-center gap-3">
          <UserSwitcher
            users={DEMO_USERS}
            activeUser={activeUser}
            onChange={setActiveUser}
          />
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
          >
            {sidebarOpen ? 'Hide context' : 'Show context'}
            {!sidebarOpen && contextItems.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px]">
                {contextItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {messages.map((msg, i) => {
              const user = msg.role === 'ai'
                ? AI_USER
                : DEMO_USERS.find(u => u.id === msg.userId)!
              const prevMsg = messages[i - 1]
              const isGrouped =
                prevMsg &&
                prevMsg.role === msg.role &&
                prevMsg.userId === msg.userId &&
                new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 60000

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  user={user}
                  isOwn={msg.role === 'user' && msg.userId === activeUser.id}
                  grouped={isGrouped}
                />
              )
            })}
            {loading && (
              <div className="flex items-center gap-2 px-1">
                <div className={`w-6 h-6 rounded-full ${AI_USER.color} flex items-center justify-center shrink-0`}>
                  <span className="text-[10px] font-semibold text-primary-foreground">{AI_USER.initials}</span>
                </div>
                <div className="flex gap-1 py-3 px-3 rounded-xl bg-mesh-ai-bg">
                  <span className="w-1.5 h-1.5 rounded-full bg-mesh-ai-fg animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-mesh-ai-fg animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-mesh-ai-fg animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-card shrink-0">
            <div className="flex items-end gap-2">
              {/* Active user pill */}
              <div className={`w-7 h-7 rounded-full ${activeUser.color} flex items-center justify-center shrink-0 mb-0.5`}>
                <span className="text-[11px] font-semibold text-white">{activeUser.initials}</span>
              </div>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message as ${activeUser.name}...`}
                className="flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all leading-relaxed max-h-32 overflow-y-auto"
                style={{ height: 'auto' }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${el.scrollHeight}px`
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mb-0.5 hover:opacity-90 transition-opacity disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground pl-9">
              Press Enter to send &middot; Shift+Enter for new line
            </p>
          </div>
        </main>

        {/* Sidebar */}
        {sidebarOpen && (
          <ContextSidebar items={contextItems} />
        )}
      </div>
    </div>
  )
}
