'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { PanelRight, PanelRightClose, X, ArrowUp, Zap, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import {
  DEMO_USERS, AI_USER,
  DEFAULT_ROOM_SETTINGS,
  type ChatMessage, type ChatUser, type ContextItem, type RoomSettings,
} from '@/lib/types'
import { UserSwitcher } from './user-switcher'
import { MessageBubble } from './message-bubble'
import { ContextSidebar } from './context-sidebar'
import { DemoPlayer } from './demo-player'
import { RoomSettingsPanel } from './room-settings'

let msgId = 0
const nextId = () => `msg-${++msgId}`

const DEMO_PROMPTS = [
  "Can you summarise everything we've agreed on so far?",
  "Mesh, what are the open tasks right now?",
  "Let's set our seed round target at $2M",
  "Priya will own the design system end of next week",
]

// Pre-seeded conversation
const t = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000)

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: nextId(), role: 'user', userId: 'jordan',
    content: "Alright team, let's lock the core decisions for the MVP before EOD. Top priority: what does the AI participant actually DO in a conversation? Summarise, extract tasks, or something more proactive?",
    timestamp: t(42),
  },
  {
    id: nextId(), role: 'user', userId: 'marcus',
    content: "I think the minimum viable behaviour is: listen to everything, surface decisions and action items in a side panel, and only speak up when asked. No unsolicited replies. That's enough to prove the value without being annoying.",
    timestamp: t(40),
  },
  {
    id: nextId(), role: 'user', userId: 'priya',
    content: "Agreed. From a design perspective, the AI should feel like a silent note-taker. Present but not intrusive. The side panel is the output, not the chat thread itself.",
    timestamp: t(38),
  },
  {
    id: nextId(), role: 'ai',
    content: "Got it. Recording that as a core design principle:\n\n**Decision:** The AI participant operates in a \"listen-first\" mode. It surfaces structured context (decisions, tasks, links) in the side panel and only responds in the chat when explicitly addressed.\n\nThis is now tracked in the Context Panel on the right.",
    timestamp: t(37),
  },
  {
    id: nextId(), role: 'user', userId: 'jordan',
    content: "Perfect. Next: stack. Marcus, what are you thinking?",
    timestamp: t(35),
  },
  {
    id: nextId(), role: 'user', userId: 'marcus',
    content: "Next.js + TypeScript for the frontend and API layer. Monorepo keeps it simple. For real-time we'll start with SSE, upgrade to WebSockets when we need bidirectional. OpenAI GPT-4o for the AI core, with the option to swap models later.\n\nBudget estimate for infra in the first 3 months: around $4,000.",
    timestamp: t(33),
  },
  {
    id: nextId(), role: 'user', userId: 'priya',
    content: "Works for me. I'll have the design system (tokens, component library, the base Figma file) ready by Friday. I'm scoping the messaging UI to feel like Linear meets iMessage.",
    timestamp: t(31),
  },
  {
    id: nextId(), role: 'ai',
    content: "Capturing a few things from that:\n\n**Decision:** Tech stack is Next.js + TypeScript (monorepo), SSE for real-time, GPT-4o as the AI model.\n\n**Task:** Priya to deliver the design system and Figma file by Friday.\n\n**Budget:** $4,000 estimated for infra over the first 3 months.\n\nAnything to add or correct?",
    timestamp: t(30),
  },
  {
    id: nextId(), role: 'user', userId: 'marcus',
    content: "One more: I'll set up the CI/CD pipeline and the staging environment by end of this week. Target is zero-downtime deploys from day one.",
    timestamp: t(28),
  },
  {
    id: nextId(), role: 'user', userId: 'jordan',
    content: "Great. On the product side, let's keep the MVP scope tight. Group chat with AI participant, context panel, and a shareable demo link. No auth, no persistence beyond the session for now. Ship fast, get feedback.\n\nHere's the full PRD: /prd",
    timestamp: t(25),
  },
  {
    id: nextId(), role: 'ai',
    content: "Added that to the panel.\n\n**Task:** Marcus to set up CI/CD pipeline and staging environment by end of week.\n\n**Decision:** MVP scope is group chat with AI participant + context panel + shareable demo link. No auth or persistence in v1.\n\n**Link:** PRD spec\n\nYou're in good shape. Three decisions locked, three tasks assigned, infra budget set. Ready to build.",
    timestamp: t(24),
  },
]

const SEED_CONTEXT: ContextItem[] = [
  { type: 'decision', text: 'AI participant operates in listen-first mode. Surfaces context in the side panel, only replies when addressed.',  addedAt: t(37) },
  { type: 'decision', text: 'Tech stack: Next.js + TypeScript (monorepo), SSE for real-time, GPT-4o as the AI model.', addedAt: t(30) },
  { type: 'decision', text: 'MVP scope: group chat + AI participant + context panel + shareable demo link. No auth or persistence in v1.', addedAt: t(24) },
  { type: 'task',     text: 'Priya: deliver design system, component library, and Figma file by Friday.', status: 'open', addedAt: t(30) },
  { type: 'task',     text: 'Marcus: set up CI/CD pipeline and staging environment by end of week.', status: 'open', addedAt: t(24) },
  { type: 'budget',   text: '$4,000 estimated for infrastructure over the first 3 months.',                           addedAt: t(30) },
  { type: 'link',     text: '/prd',                                                        addedAt: t(24) },
]

export function ChatApp() {
  const [activeUser,      setActiveUser]      = useState<ChatUser>(DEMO_USERS[0])
  const [messages,        setMessages]        = useState<ChatMessage[]>(SEED_MESSAGES)
  const [input,           setInput]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [contextItems,    setContextItems]    = useState<ContextItem[]>(SEED_CONTEXT)
  const [sidebarOpen,     setSidebarOpen]     = useState(true)
  const [bannerVisible,   setBannerVisible]   = useState(true)
  const [roomSettings,    setRoomSettings]    = useState<RoomSettings>(DEFAULT_ROOM_SETTINGS)
  const [demoActive,      setDemoActive]      = useState(false)
  const [listeningFlash,  setListeningFlash]  = useState(false)
  const [highlightedMsg,  setHighlightedMsg]  = useState<string | null>(null)
  const [roomName,        setRoomName]        = useState('Product Sprint')
  const [showReveal,      setShowReveal]      = useState(false)
  const [mobileDrawer,    setMobileDrawer]    = useState(false)
  const [feedback,        setFeedback]        = useState<Map<string, 'up' | 'down'>>(new Map())
  const { theme, setTheme } = useTheme()

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // "Mesh is listening" flash
  const showListening = useCallback(() => {
    setListeningFlash(true)
    const timer = setTimeout(() => setListeningFlash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const addContextItems = useCallback((items: ContextItem[]) => {
    if (!items.length) return
    setContextItems(prev => {
      const seen = new Set(prev.map(i => i.text.toLowerCase()))
      const fresh = items.filter(i => !seen.has(i.text.toLowerCase()))
      return fresh.length ? [...prev, ...fresh] : prev
    })
  }, [])

  const toggleTask = useCallback((index: number) => {
    setContextItems(prev =>
      prev.map((item, i) =>
        i === index && item.type === 'task'
          ? { ...item, status: item.status === 'done' ? 'open' as const : 'done' as const }
          : item
      )
    )
  }, [])

  const removeItem = useCallback((index: number) => {
    setContextItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearAllItems = useCallback(() => {
    setContextItems([])
  }, [])

  const scrollToMessage = useCallback((messageId: string) => {
    setHighlightedMsg(messageId)
    const el = messagesRef.current?.querySelector(`[data-message-id="${messageId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlightedMsg(null), 2500)
  }, [])

  const handleFeedback = useCallback((messageId: string, type: 'up' | 'down', note?: string) => {
    setFeedback(prev => new Map(prev).set(messageId, type))
    if (type === 'up') {
      const msg = messages.find(m => m.id === messageId)
      if (msg) {
        const snippet = msg.content.slice(0, 80)
        setRoomSettings(prev => ({
          ...prev,
          learnedPreferences: [...prev.learnedPreferences, `More like: ${snippet}`],
        }))
      }
    } else if (type === 'down' && note) {
      setRoomSettings(prev => ({
        ...prev,
        learnedPreferences: [...prev.learnedPreferences, `Avoid: ${note}`],
      }))
    }
  }, [messages])

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id:        nextId(),
      role:      'user',
      userId:    activeUser.id,
      content:   text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    setLoading(true)

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role !== 'agent')
        .map(m => ({
          role:    m.role === 'ai' ? 'assistant' : 'user',
          content:
            m.role === 'user'
              ? `[${DEMO_USERS.find(u => u.id === m.userId)?.name ?? 'User'}]: ${m.content}`
              : m.content,
        }))

      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history, settings: roomSettings }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const contentType = res.headers.get('Content-Type') ?? ''
      const aiMsgId = nextId()

      if (contentType.includes('text/event-stream')) {
        // Streaming response: AI is responding
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let streamedContent = ''
        let metaReceived = false

        // Add placeholder AI message immediately
        setMessages(prev => [
          ...prev,
          { id: aiMsgId, role: 'ai' as const, content: '', timestamp: new Date() },
        ])
        setLoading(false)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = JSON.parse(line.slice(6))

            if (payload.type === 'meta') {
              metaReceived = true
              if (payload.contextItems?.length) {
                addContextItems(
                  payload.contextItems.map((i: Omit<ContextItem, 'addedAt'>) => ({
                    ...i,
                    addedAt: new Date(),
                    messageId: aiMsgId,
                    ...(i.type === 'task' ? { status: 'open' as const } : {}),
                  }))
                )
                if (!sidebarOpen) setSidebarOpen(true)
              }
            } else if (payload.type === 'text') {
              streamedContent += payload.content
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMsgId ? { ...m, content: streamedContent } : m
                )
              )
            }
          }
        }
      } else {
        // JSON response: AI stayed silent
        const data = await res.json()

        if (data.shouldRespond === false) {
          showListening()
        }

        if (data.contextItems?.length) {
          addContextItems(
            data.contextItems.map((i: Omit<ContextItem, 'addedAt'>) => ({
              ...i,
              addedAt: new Date(),
              messageId: userMsg.id,
              ...(i.type === 'task' ? { status: 'open' as const } : {}),
            }))
          )
          if (!sidebarOpen) setSidebarOpen(true)
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id:        nextId(),
          role:      'ai',
          content:   'Something went wrong. Please try again.',
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

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  // Demo player callbacks
  const handleDemoStart = useCallback(() => {
    setDemoActive(true)
    setMessages([])
    setContextItems([])
    setRoomName('Launch Pricing')
    setBannerVisible(false)
    setRoomSettings(prev => ({
      ...prev,
      roomRules: 'Always include unit economics when discussing pricing.\nNever suggest budget cuts without presenting alternatives.',
    }))
  }, [])

  const handleDemoEnd = useCallback(() => {
    setDemoActive(false)
  }, [])

  const handleDemoMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const handleDemoContextItems = useCallback((items: ContextItem[]) => {
    addContextItems(
      items.map(i => ({
        ...i,
        ...(i.type === 'task' ? { status: 'open' as const } : {}),
      }))
    )
    if (!sidebarOpen) setSidebarOpen(true)
  }, [addContextItems, sidebarOpen])

  const handleDemoSilent = useCallback(() => {
    showListening()
  }, [showListening])

  const handleDemoReveal = useCallback(() => {
    setShowReveal(true)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-3 md:px-5 h-12 md:h-14 border-b border-border bg-card shrink-0">

        {/* Left: brand + room */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <svg width="11" height="11" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="md:w-[13px] md:h-[13px]">
                <circle cx="6"  cy="6"  r="3.5" fill="white" />
                <circle cx="14" cy="6"  r="3.5" fill="white" fillOpacity="0.55" />
                <circle cx="6"  cy="14" r="3.5" fill="white" fillOpacity="0.55" />
                <circle cx="14" cy="14" r="3.5" fill="white" fillOpacity="0.25" />
              </svg>
            </div>
            <span className="text-[13px] md:text-[14px] font-semibold tracking-tight text-foreground">mesh</span>
          </div>

          <span className="text-border select-none">/</span>

          <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
            <span className="text-[12px] md:text-[13px] font-medium text-foreground truncate">{roomName}</span>
            <span className="shrink-0 text-[9px] md:text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full leading-none">
              DEMO
            </span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">

          {/* Stacked avatars + listening indicator (hidden on small mobile) */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center -space-x-1.5">
              {DEMO_USERS.map(u => (
                <div
                  key={u.id}
                  title={`${u.name}, ${u.role}`}
                  className={`w-7 h-7 rounded-full ${u.color} flex items-center justify-center
                    border-[2px] border-card shadow-sm ring-0`}
                >
                  <span className="text-[9px] font-bold text-white leading-none">{u.initials}</span>
                </div>
              ))}
              <div
                title="Mesh (AI)"
                className={`w-7 h-7 rounded-full bg-primary flex items-center justify-center
                  border-[2px] border-card shadow-sm transition-all duration-300
                  ${listeningFlash ? 'ring-2 ring-primary/40 ring-offset-1 scale-110' : ''}`}
              >
                <span className="text-[9px] font-bold text-white leading-none">AI</span>
              </div>
            </div>

            {/* "Mesh heard that" text */}
            {listeningFlash && (
              <span className="text-[10px] text-primary font-medium animate-pulse whitespace-nowrap">
                Mesh heard that
              </span>
            )}
          </div>

          {/* Demo player (compact on mobile) */}
          <div className="hidden md:block">
            <DemoPlayer
              onMessage={handleDemoMessage}
              onContextItems={handleDemoContextItems}
              onSilent={handleDemoSilent}
              onReveal={handleDemoReveal}
              onStart={handleDemoStart}
              onEnd={handleDemoEnd}
              isActive={demoActive}
              nextId={nextId}
            />
          </div>

          <UserSwitcher users={DEMO_USERS} activeUser={activeUser} onChange={setActiveUser} />

          <div className="hidden md:block">
            <RoomSettingsPanel settings={roomSettings} onChange={setRoomSettings} />
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center w-8 h-8 rounded-lg
              text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent
              hover:border-border transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="relative hidden md:flex items-center justify-center w-8 h-8 rounded-lg
              text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent
              hover:border-border transition-all"
            aria-label={sidebarOpen ? 'Hide context panel' : 'Show context panel'}
          >
            {sidebarOpen ? <PanelRightClose size={15} /> : <PanelRight size={15} />}
            {!sidebarOpen && contextItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground
                text-[9px] font-bold flex items-center justify-center shadow">
                {contextItems.length}
              </span>
            )}
          </button>

          {/* Mobile context drawer toggle */}
          <button
            onClick={() => setMobileDrawer(true)}
            className="relative flex md:hidden items-center justify-center w-8 h-8 rounded-lg
              text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent
              hover:border-border transition-all"
            aria-label="Show context panel"
          >
            <Zap size={14} />
            {contextItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground
                text-[9px] font-bold flex items-center justify-center shadow">
                {contextItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chat column */}
        <main className="flex flex-col flex-1 overflow-hidden min-w-0">

          {/* Demo guide banner */}
          {bannerVisible && (
            <div className="mx-5 mt-4 shrink-0">
              <div className="rounded-xl border border-border bg-card shadow-sm px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground mb-0.5">
                      How to demo Mesh
                    </p>
                    <p className="text-[11.5px] text-muted-foreground mb-3 leading-relaxed">
                      The team has been planning their MVP. Continue the conversation below, or pick a prompt to see Mesh in action.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DEMO_PROMPTS.map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => {
                            setBannerVisible(false)
                            sendMessage(prompt)
                          }}
                          className="text-[11.5px] text-primary border border-primary/30 bg-primary/5
                            hover:bg-primary/10 rounded-lg px-3 py-1.5 transition-colors leading-snug text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setBannerVisible(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5 p-0.5"
                    aria-label="Dismiss guide"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
            {messages.map((msg, i) => {
              const agentForUser = msg.role === 'agent' ? DEMO_USERS.find(u => u.id === msg.agentFor) : undefined
              const user    = msg.role === 'ai' ? AI_USER : msg.role === 'agent' ? (agentForUser ?? AI_USER) : DEMO_USERS.find(u => u.id === msg.userId)!
              const prevMsg = messages[i - 1]
              const grouped =
                !!prevMsg &&
                prevMsg.role === msg.role &&
                prevMsg.userId === msg.userId &&
                msg.role !== 'agent' &&
                new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 90_000

              // Show callout before the first agent message
              const isFirstAgent = msg.role === 'agent' && (!prevMsg || prevMsg.role !== 'agent')
              const prevIsNotAgent = !prevMsg || prevMsg.role !== 'agent'

              return (
                <div key={msg.id}>
                  {isFirstAgent && prevIsNotAgent && (
                    <div className="mt-5 mb-3 mx-auto max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 px-4 py-2.5 text-center">
                        <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-0.5">
                          Agent-to-Agent
                        </p>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          Personal AI agents negotiate on behalf of their humans.
                        </p>
                      </div>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    user={user}
                    isOwn={msg.role === 'user' && msg.userId === activeUser.id}
                    grouped={grouped}
                    highlighted={highlightedMsg === msg.id}
                    agentForUser={agentForUser}
                    onFeedback={msg.role === 'ai' ? handleFeedback : undefined}
                    feedback={feedback.get(msg.id)}
                  />
                </div>
              )
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-3 mt-5">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-[9px] font-bold text-white">AI</span>
                </div>
                <div className="bg-card border border-primary/15 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Reveal card: Marcus was the AI */}
            {showReveal && (
              <div className="mt-6 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 px-6 py-5 shadow-lg text-center">
                  <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                    Plot twist
                  </p>
                  <p className="text-[18px] font-bold text-foreground mb-2">
                    Marcus was the AI the whole time.
                  </p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                    Every message from &quot;Marcus&quot; was generated by Mesh. The unit economics,
                    the fatal flaw in flat pricing, the two-tier proposal, the LOI risk,
                    the A/B test suggestion. All AI. Could you tell?
                  </p>
                  <div className="text-left space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full leading-none mt-0.5 shrink-0">1</span>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">AI with taste.</span> Mesh contributed real analysis and stayed silent during banter.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full leading-none mt-0.5 shrink-0">2</span>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Agent-to-agent.</span> Personal agents just negotiated a meeting time above.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full leading-none mt-0.5 shrink-0">3</span>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Community intelligence.</span> The team shapes AI behavior through rules and feedback.
                      </p>
                    </div>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
                    Send a message below to see Mesh respond. Then use the thumbs up/down to give feedback, or tap the gear icon to see the room rules the team set.
                  </p>
                  <button
                    onClick={() => setShowReveal(false)}
                    className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 pb-5 pt-2 shrink-0">
            <div
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden
                focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 transition-all"
            >
              {/* "Sending as" row */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <div className={`w-5 h-5 rounded-full ${activeUser.color} flex items-center justify-center shrink-0`}>
                  <span className="text-[8px] font-bold text-white leading-none">{activeUser.initials}</span>
                </div>
                <span className="text-[11.5px] text-muted-foreground">
                  Chatting as <span className="font-semibold text-foreground">{activeUser.name}</span>
                  <span className="text-muted-foreground/60"> · {activeUser.role}</span>
                </span>
              </div>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(e.currentTarget) }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={demoActive}
                className="w-full resize-none bg-transparent px-4 py-2 text-[13.5px] text-foreground
                  placeholder:text-muted-foreground outline-none leading-relaxed disabled:opacity-50"
              />

              {/* Toolbar row */}
              <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-2">
                <p className="text-[11px] text-muted-foreground/70">
                  Enter to send &nbsp;·&nbsp; Shift+Enter for new line
                </p>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading || demoActive}
                  aria-label="Send message"
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-primary-foreground
                    hover:opacity-90 active:scale-95 transition-all disabled:opacity-35 shrink-0 shadow-sm"
                >
                  <ArrowUp size={15} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Context sidebar: desktop */}
        {sidebarOpen && (
          <div className="hidden md:flex">
            <ContextSidebar
              items={contextItems}
              onToggleTask={toggleTask}
              onJumpToMessage={scrollToMessage}
              onRemoveItem={removeItem}
              onClearAll={clearAllItems}
            />
          </div>
        )}

        {/* Context sidebar: mobile drawer */}
        <Drawer open={mobileDrawer} onOpenChange={setMobileDrawer}>
          <DrawerContent className="max-h-[85vh]">
            <div className="overflow-y-auto">
              <ContextSidebar
                items={contextItems}
                onToggleTask={toggleTask}
                onJumpToMessage={(id) => {
                  setMobileDrawer(false)
                  scrollToMessage(id)
                }}
                onRemoveItem={removeItem}
                onClearAll={clearAllItems}
                mobile
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
