'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
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
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-secondary transition-colors text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className={`w-6 h-6 rounded-full ${activeUser.color} flex items-center justify-center`}>
          <span className="text-[10px] font-semibold text-white">{activeUser.initials}</span>
        </div>
        <span className="text-foreground font-medium">{activeUser.name}</span>
        <ChevronDown size={13} className="text-muted-foreground" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card shadow-lg z-50 py-1 overflow-hidden"
        >
          <p className="px-3 pt-1.5 pb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Switch user
          </p>
          {users.map(user => (
            <button
              key={user.id}
              role="option"
              aria-selected={user.id === activeUser.id}
              onClick={() => { onChange(user); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-secondary transition-colors ${
                user.id === activeUser.id ? 'bg-secondary/60' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${user.color} flex items-center justify-center`}>
                <span className="text-[10px] font-semibold text-white">{user.initials}</span>
              </div>
              <span className="text-foreground">{user.name}</span>
              {user.id === activeUser.id && (
                <span className="ml-auto text-[10px] text-muted-foreground">active</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
