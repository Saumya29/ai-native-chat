'use client'

import { CheckSquare, GitBranch, Link2, DollarSign, Inbox } from 'lucide-react'
import { type ContextItem } from '@/lib/types'

interface ContextSidebarProps {
  items: ContextItem[]
}

const TYPE_CONFIG: Record<
  ContextItem['type'],
  { label: string; Icon: React.ElementType; iconClass: string; pillClass: string }
> = {
  decision: {
    label: 'Decision',
    Icon: GitBranch,
    iconClass: 'text-indigo-500',
    pillClass: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  task: {
    label: 'Task',
    Icon: CheckSquare,
    iconClass: 'text-emerald-500',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  link: {
    label: 'Link',
    Icon: Link2,
    iconClass: 'text-sky-500',
    pillClass: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  budget: {
    label: 'Budget',
    Icon: DollarSign,
    iconClass: 'text-amber-500',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-100',
  },
}

const ORDER: ContextItem['type'][] = ['decision', 'task', 'budget', 'link']

export function ContextSidebar({ items }: ContextSidebarProps) {
  const grouped = ORDER.reduce<Record<string, ContextItem[]>>((acc, type) => {
    acc[type] = items.filter(i => i.type === type)
    return acc
  }, {})

  const hasItems = items.length > 0

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-mesh-panel flex flex-col overflow-hidden">
      {/* Sidebar header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Context
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Mesh tracks what matters
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
            <Inbox size={24} className="text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Decisions, tasks, and links will appear here as you chat.
            </p>
          </div>
        ) : (
          ORDER.map(type => {
            const sectionItems = grouped[type]
            if (sectionItems.length === 0) return null
            const config = TYPE_CONFIG[type]
            return (
              <section key={type}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <config.Icon size={12} className={config.iconClass} />
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {config.label}s
                  </h3>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {sectionItems.length}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {sectionItems.map((item, idx) => (
                    <li
                      key={idx}
                      className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${config.pillClass}`}
                    >
                      {item.type === 'link' ? (
                        <a
                          href={item.text.startsWith('http') ? item.text : `https://${item.text}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 break-all"
                        >
                          {item.text}
                        </a>
                      ) : (
                        <span className="break-words">{item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })
        )}
      </div>

      {hasItems && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
      )}
    </aside>
  )
}
