'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, PanelRight, PanelRightClose, X } from 'lucide-react'
import { DEMO_USERS, AI_USER, type ChatMessage, type ChatUser, type ContextItem } from '@/lib/types'
import { UserSwitcher } from './user-switcher'
import { MessageBubble } from './message-bubble'
import { ContextSidebar } from './context-sidebar'

let msgId = 0
const nextId = () => `msg-${++msgId}`

const DEMO_PROMPTS = [
  "We've decided to use Next.js for the frontend",
  "Bob will handle the design mockups by Friday",
  "Our Q2 budget is capped at $8,000",
  "Can you summarize what we've decided so far?",
]

export function ChatApp() {
  const [activeUser, setActiveUser] = useState<ChatUser>(DEMO_USERS[0])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      role: 'ai',
      content: "Hey team! I'm Mesh — I'll be your AI collaborator in this session.\n\nAs you chat, I'll track decisions, tasks, budget figures, and links in the panel on the right. Try making a decision or assigning a task to see it in action.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [contextItems, setContextItems] = useState<ContextItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(false)
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

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim()
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
        content:
          m.role === 'user'
            ? `[${DEMO_USERS.find(u => u.id === m.userId)?.name ?? 'User'}]: ${m.content}`
            : m.content,
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
        addContextItems(
          data.contextItems.map((i: Omit<ContextItem, 'addedAt'>) => ({
            ...i,
            addedAt: new Date(),
          }))
        )
        if (!sidebarOpen) setSidebarOpen(true)
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: nextId(),
          role: 'ai',
          content: 'Something went wrong. Please try again.',
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
      <header className="flex items-center justify-between px-4 h-13 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="4" cy="4" r="2.5" fill="white" />
                <circle cx="10" cy="4" r="2.5" fill="white" opacity="0.6" />
                <circle cx="4" cy="10" r="2.5" fill="white" opacity="0.6" />
                <circle cx="10" cy="10" r="2.5" fill="white" opacity="0.3" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">mesh</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground font-medium">Product Sprint</span>
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              demo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Participant avatars */}
          <div className="flex items-center -space-x-1.5 mr-1">
            {DEMO_USERS.map(u => (
              <div
                key={u.id}
                title={u.name}
                className={`w-6 h-6 rounded-full ${u.color} flex items-center justify-center border-2 border-card`}
              >
                <span className="text-[9px] font-bold text-white leading-none">{u.initials}</span>
              </div>
            ))}
            <div
              title="Mesh (AI)"
              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-card"
            >
              <span className="text-[9px] font-bold text-white leading-none">M</span>
            </div>
          </div>

          <UserSwitcher users={DEMO_USERS} activeUser={activeUser} onChange={setActiveUser} />

          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
            aria-label={sidebarOpen ? 'Hide context panel' : 'Show context panel'}
            title={sidebarOpen ? 'Hide context panel' : 'Show context panel'}
          >
            {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
            {!sidebarOpen && contextItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                {contextItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <main className="flex flex-col flex-1 overflow-hidden min-w-0">

          {/* Demo guide banner */}
          {!bannerDismissed && (
            <div className="mx-4 mt-3 shrink-0">
              <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground mb-2">
                      How to demo Mesh
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {DEMO_PROMPTS.map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => {
                            sendMessage(prompt)
                            setBannerDismissed(true)
                          }}
                          className="text-[11px] text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full px-2.5 py-1 transition-colors leading-none"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setBannerDismissed(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
                    aria-label="Dismiss"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Click a prompt above, or type your own message. Switch users in the header to simulate a group conversation.
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-3">
            {messages.map((msg, i) => {
              const user = msg.role === 'ai' ? AI_USER : DEMO_USERS.find(u => u.id === msg.userId)!
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
                  grouped={!!isGrouped}
                />
              )
            })}

            {loading && (
              <div className="flex items-start gap-2.5 mt-4">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-white leading-none">M</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-primary">
                    Mesh <span className="text-[10px] font-medium text-primary/60 bg-primary/8 px-1.5 py-0.5 rounded-full">AI</span>
                  </span>
                  <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm bg-primary/[0.06] border border-primary/10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="px-4 pb-4 shrink-0">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 transition-all">
              {/* Who's typing indicator */}
              <div className="flex items-center gap-2 px-3.5 pt-2.5 pb-1">
                <div className={`w-5 h-5 rounded-full ${activeUser.color} flex items-center justify-center shrink-0`}>
                  <span className="text-[9px] font-bold text-white leading-none">{activeUser.initials}</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Sending as <span className="text-foreground">{activeUser.name}</span>
                </span>
              </div>

              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full resize-none bg-transparent px-3.5 pb-2 pt-1 text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed max-h-32 overflow-y-auto"
                style={{ height: 'auto' }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${el.scrollHeight}px`
                }}
              />

              <div className="flex items-center justify-between px-3 pb-2.5 gap-2">
                <p className="text-[10px] text-muted-foreground">
                  Enter to send &middot; Shift+Enter for new line
                </p>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-40 shrink-0"
                  aria-label="Send message"
                >
                  <Send size={12} />
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Context sidebar */}
        {sidebarOpen && <ContextSidebar items={contextItems} />}
      </div>
    </div>
  )
}
