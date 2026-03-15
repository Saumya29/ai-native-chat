'use client'

import { CheckSquare, GitBranch, Link2, DollarSign, Sparkles } from 'lucide-react'
import { type ContextItem } from '@/lib/types'

interface ContextSidebarProps {
  items: ContextItem[]
}

const TYPE_CONFIG: Record<
  ContextItem['type'],
  { label: string; Icon: React.ElementType; iconClass: string; rowClass: string; dotClass: string }
> = {
  decision: {
    label: 'Decisions',
    Icon: GitBranch,
    iconClass: 'text-indigo-500',
    rowClass: 'border-l-2 border-indigo-300 bg-indigo-50/60',
    dotClass: 'bg-indigo-400',
  },
  task: {
    label: 'Tasks',
    Icon: CheckSquare,
    iconClass: 'text-emerald-500',
    rowClass: 'border-l-2 border-emerald-300 bg-emerald-50/60',
    dotClass: 'bg-emerald-400',
  },
  link: {
    label: 'Links',
    Icon: Link2,
    iconClass: 'text-sky-500',
    rowClass: 'border-l-2 border-sky-300 bg-sky-50/60',
    dotClass: 'bg-sky-400',
  },
  budget: {
    label: 'Budget',
    Icon: DollarSign,
    iconClass: 'text-amber-500',
    rowClass: 'border-l-2 border-amber-300 bg-amber-50/60',
    dotClass: 'bg-amber-400',
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
    <aside className="w-[280px] shrink-0 border-l border-border bg-muted/30 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-primary" />
          <h2 className="text-xs font-semibold text-foreground">Context panel</h2>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          Mesh automatically extracts key info from your conversation.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {!hasItems ? (
          <div className="py-8 px-2 text-center">
            <div className="text-muted-foreground/30 mb-3">
              <Sparkles size={28} className="mx-auto" />
            </div>
            <p className="text-xs font-medium text-foreground mb-1">Nothing tracked yet</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-5">
              Start chatting and Mesh will extract decisions, tasks, budget figures, and links as they come up.
            </p>
            {/* Suggested prompts */}
            <div className="text-left space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Try saying...</p>
              {[
                '"We decided to use Next.js"',
                '"Bob will handle the design by Friday"',
                '"Budget is $5,000 for Q2"',
              ].map(prompt => (
                <div key={prompt} className="rounded-md bg-background border border-border px-2.5 py-1.5">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{prompt}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {ORDER.map(type => {
              const sectionItems = grouped[type]
              if (sectionItems.length === 0) return null
              const config = TYPE_CONFIG[type]
              return (
                <section key={type}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <config.Icon size={11} className={config.iconClass} />
                    <h3 className="text-[11px] font-semibold text-foreground">{config.label}</h3>
                    <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-border/60 rounded-full px-1.5 py-0.5">
                      {sectionItems.length}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {sectionItems.map((item, idx) => (
                      <li
                        key={idx}
                        className={`rounded-md pl-3 pr-3 py-2 text-xs leading-relaxed text-foreground ${config.rowClass}`}
                      >
                        {item.type === 'link' ? (
                          <a
                            href={item.text.startsWith('http') ? item.text : `https://${item.text}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 underline underline-offset-2 break-all hover:text-sky-700"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <span>{item.text}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer count */}
      {hasItems && (
        <div className="px-4 py-2.5 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} tracked in this session
          </p>
        </div>
      )}
    </aside>
  )
}
