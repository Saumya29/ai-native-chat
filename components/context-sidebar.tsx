'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { CheckSquare, GitBranch, Link2, DollarSign, Zap, Check, X } from 'lucide-react'
import { type ContextItem } from '@/lib/types'

const MIN_WIDTH = 220
const MAX_WIDTH = 520
const DEFAULT_WIDTH = 268

interface ContextSidebarProps {
  items: ContextItem[]
  onToggleTask?: (index: number) => void
  onJumpToMessage?: (messageId: string) => void
  onRemoveItem?: (index: number) => void
  onClearAll?: () => void
  mobile?: boolean
}

const TYPE_CONFIG: Record<
  ContextItem['type'],
  { label: string; Icon: React.ElementType; pill: string; bar: string }
> = {
  decision: {
    label: 'Decisions',
    Icon:  GitBranch,
    pill:  'bg-violet-100 text-violet-700',
    bar:   'bg-violet-400',
  },
  task: {
    label: 'Tasks',
    Icon:  CheckSquare,
    pill:  'bg-emerald-100 text-emerald-700',
    bar:   'bg-emerald-400',
  },
  link: {
    label: 'Links',
    Icon:  Link2,
    pill:  'bg-sky-100 text-sky-700',
    bar:   'bg-sky-400',
  },
  budget: {
    label: 'Budget',
    Icon:  DollarSign,
    pill:  'bg-amber-100 text-amber-700',
    bar:   'bg-amber-400',
  },
}

const ORDER: ContextItem['type'][] = ['decision', 'task', 'budget', 'link']

const DEMO_SUGGESTIONS = [
  { type: 'decision', text: '"We\'re going with Next.js for the frontend"' },
  { type: 'task',     text: '"Marcus will set up the CI/CD pipeline"' },
  { type: 'budget',   text: '"Q2 engineering budget is $15,000"' },
]

function relativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function parseBudgetAmount(text: string): number | null {
  const match = text.match(/\$[\d,]+(?:\.\d{2})?/)
  if (!match) return null
  return parseFloat(match[0].replace(/[$,]/g, ''))
}

export function ContextSidebar({ items, onToggleTask, onJumpToMessage, onRemoveItem, onClearAll, mobile }: ContextSidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(DEFAULT_WIDTH)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = width
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [width])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const delta = startX.current - e.clientX // dragging left = positive = wider
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW.current + delta))
    setWidth(next)
  }, [])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const grouped = ORDER.reduce<Record<string, ContextItem[]>>((acc, type) => {
    acc[type] = items.filter(i => i.type === type)
    return acc
  }, {})

  const hasItems = items.length > 0

  // Budget summary
  const budgetItems = grouped['budget']
  const budgetAmounts = budgetItems.map(b => parseBudgetAmount(b.text)).filter((n): n is number => n !== null)
  const budgetTotal = budgetAmounts.reduce((sum, n) => sum + n, 0)

  // Task stats
  const taskItems = grouped['task']
  const doneTasks = taskItems.filter(t => t.status === 'done').length
  const totalTasks = taskItems.length

  return (
    <aside
      className={
        mobile
          ? 'w-full bg-background flex flex-col overflow-hidden'
          : 'shrink-0 border-l border-border bg-sidebar flex flex-col overflow-hidden relative'
      }
      style={mobile ? undefined : { width }}
    >
      {/* Drag handle (desktop only) */}
      {!mobile && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10
            hover:bg-primary/10 active:bg-primary/20 transition-colors"
        />
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap size={12} className="text-primary" />
          </div>
          <h2 className="text-[13px] font-semibold text-foreground tracking-tight">Context Panel</h2>
          {hasItems && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
              {onClearAll && (
                <button
                  onClick={onClearAll}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-[11.5px] text-muted-foreground leading-relaxed pl-8">
          Mesh extracts key info from the conversation automatically.
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {!hasItems ? (
          <div className="py-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Try saying something like...
            </p>
            <ul className="space-y-2">
              {DEMO_SUGGESTIONS.map(({ type, text }) => {
                const { Icon, bar, pill } = TYPE_CONFIG[type as ContextItem['type']]
                return (
                  <li key={text} className="flex items-start gap-2.5 rounded-lg bg-card border border-border px-3 py-2.5">
                    <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${pill}`}>
                      <Icon size={11} />
                    </div>
                    <p className="text-[11.5px] text-muted-foreground leading-relaxed">{text}</p>
                  </li>
                )
              })}
            </ul>
            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
              Items will appear here as the conversation unfolds.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Budget summary */}
            {budgetItems.length > 0 && budgetTotal > 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-200/60 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={12} className="text-amber-600" />
                  <span className="text-[11px] font-semibold text-amber-800">Budget Summary</span>
                </div>
                <p className="text-[18px] font-bold text-amber-900 tracking-tight">
                  ${budgetTotal.toLocaleString()}
                </p>
                <p className="text-[10px] text-amber-700">
                  across {budgetItems.length} item{budgetItems.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {ORDER.map(type => {
              const sectionItems = grouped[type]
              if (sectionItems.length === 0) return null
              const { label, Icon, pill, bar } = TYPE_CONFIG[type]

              return (
                <section key={type}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${pill}`}>
                      <Icon size={11} />
                    </div>
                    <span className="text-[12px] font-semibold text-foreground">{label}</span>
                    {type === 'task' && totalTasks > 0 ? (
                      <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                        {doneTasks}/{totalTasks}
                      </span>
                    ) : (
                      <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                        {sectionItems.length}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1.5">
                    {sectionItems.map((item, idx) => {
                      const globalIdx = items.indexOf(item)
                      const isDone = item.status === 'done'
                      const isTask = item.type === 'task'

                      return (
                        <li
                          key={idx}
                          className={`group flex items-start gap-2.5 rounded-lg bg-card border border-border px-3 py-2.5
                            ${item.messageId && onJumpToMessage ? 'cursor-pointer hover:border-primary/30 hover:bg-primary/5' : ''}
                            transition-colors`}
                          onClick={() => item.messageId && onJumpToMessage?.(item.messageId)}
                        >
                          {/* Task checkbox or dot */}
                          {isTask && onToggleTask ? (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                onToggleTask(globalIdx)
                              }}
                              className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors
                                ${isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-border hover:border-emerald-400'
                                }`}
                            >
                              {isDone && <Check size={10} />}
                            </button>
                          ) : (
                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${bar}`} />
                          )}

                          <div className="flex-1 min-w-0">
                            {item.type === 'link' ? (
                              <a
                                href={item.text.startsWith('http') || item.text.startsWith('/') ? item.text : `https://${item.text}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[12px] text-sky-600 underline underline-offset-2 break-all hover:text-sky-700 leading-relaxed"
                                onClick={e => e.stopPropagation()}
                              >
                                {item.text}
                              </a>
                            ) : (
                              <span className={`text-[12px] leading-relaxed ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {item.text}
                              </span>
                            )}
                            <span className="block text-[10px] text-muted-foreground/60 mt-0.5">
                              {relativeTime(item.addedAt)}
                            </span>
                          </div>

                          {/* Dismiss button */}
                          {onRemoveItem && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                onRemoveItem(globalIdx)
                              }}
                              className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground/50
                                hover:text-foreground transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasItems && (
        <div className="px-5 py-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} captured this session
          </p>
        </div>
      )}
    </aside>
  )
}
