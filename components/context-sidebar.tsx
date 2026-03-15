'use client'

import { CheckSquare, GitBranch, Link2, DollarSign, Zap } from 'lucide-react'
import { type ContextItem } from '@/lib/types'

interface ContextSidebarProps {
  items: ContextItem[]
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

export function ContextSidebar({ items }: ContextSidebarProps) {
  const grouped = ORDER.reduce<Record<string, ContextItem[]>>((acc, type) => {
    acc[type] = items.filter(i => i.type === type)
    return acc
  }, {})

  const hasItems = items.length > 0

  return (
    <aside className="w-[268px] shrink-0 border-l border-border bg-sidebar flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap size={12} className="text-primary" />
          </div>
          <h2 className="text-[13px] font-semibold text-foreground tracking-tight">Context Panel</h2>
          {hasItems && (
            <span className="ml-auto text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
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
                    <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                      {sectionItems.length}
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {sectionItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 rounded-lg bg-card border border-border px-3 py-2.5"
                      >
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${bar}`} />
                        {item.type === 'link' ? (
                          <a
                            href={item.text.startsWith('http') ? item.text : `https://${item.text}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12px] text-sky-600 underline underline-offset-2 break-all hover:text-sky-700 leading-relaxed"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <span className="text-[12px] text-foreground leading-relaxed">{item.text}</span>
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
