'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { type ChatUser } from '@/lib/types'

interface UserSwitcherProps {
  users:      ChatUser[]
  activeUser: ChatUser
  onChange:   (user: ChatUser) => void
}

export function UserSwitcher({ users, activeUser, onChange }: UserSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch active user"
        className="flex items-center gap-2 h-8 rounded-lg px-2.5 border border-border bg-card
          hover:bg-secondary transition-colors text-sm"
      >
        <div className={`w-5 h-5 rounded-full ${activeUser.color} flex items-center justify-center shrink-0`}>
          <span className="text-[9px] font-bold text-white leading-none">{activeUser.initials}</span>
        </div>
        <span className="text-[13px] font-medium text-foreground">{activeUser.name}</span>
        <ChevronDown
          size={12}
          className={`text-muted-foreground transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select user"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-card shadow-lg z-50 py-2 overflow-hidden"
        >
          <p className="px-3.5 pt-1 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Chat as
          </p>
          {users.map(user => (
            <button
              key={user.id}
              role="option"
              aria-selected={user.id === activeUser.id}
              onClick={() => { onChange(user); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-secondary transition-colors"
            >
              <div className={`w-7 h-7 rounded-full ${user.color} flex items-center justify-center shrink-0`}>
                <span className="text-[10px] font-bold text-white leading-none">{user.initials}</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-medium text-foreground leading-tight">{user.name}</p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">{user.role}</p>
              </div>
              {user.id === activeUser.id && (
                <Check size={13} className="text-primary shrink-0" />
              )}
            </button>
          ))}
          <div className="mx-3.5 mt-2 pt-2 border-t border-border">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Switch users to simulate a real group chat.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
