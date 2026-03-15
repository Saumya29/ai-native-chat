'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { type ChatUser } from '@/lib/types'

interface UserSwitcherProps {
  users: ChatUser[]
  activeUser: ChatUser
  onChange: (user: ChatUser) => void
}

export function UserSwitcher({ users, activeUser, onChange }: UserSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-secondary transition-colors text-sm border border-transparent hover:border-border"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch active user"
      >
        <div className={`w-5 h-5 rounded-full ${activeUser.color} flex items-center justify-center shrink-0`}>
          <span className="text-[9px] font-bold text-white leading-none">{activeUser.initials}</span>
        </div>
        <span className="text-foreground text-xs font-medium">{activeUser.name}</span>
        <ChevronDown size={11} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select user"
          className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-border bg-card shadow-lg z-50 py-1.5 overflow-hidden"
        >
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Simulate as
          </p>
          {users.map(user => (
            <button
              key={user.id}
              role="option"
              aria-selected={user.id === activeUser.id}
              onClick={() => { onChange(user); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <div className={`w-6 h-6 rounded-full ${user.color} flex items-center justify-center shrink-0`}>
                <span className="text-[10px] font-bold text-white leading-none">{user.initials}</span>
              </div>
              <span className="text-sm text-foreground flex-1 text-left">{user.name}</span>
              {user.id === activeUser.id && (
                <Check size={12} className="text-primary shrink-0" />
              )}
            </button>
          ))}
          <div className="mx-3 mt-1.5 pt-1.5 border-t border-border">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Switch users to simulate a real group conversation.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
