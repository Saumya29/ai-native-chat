'use client'

import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const DEMO_PASSWORD = 'mesh2024'
const SESSION_KEY   = 'mesh_auth'

interface PasswordGateProps {
  children: React.ReactNode
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [authed,    setAuthed]    = useState<boolean | null>(null)
  const [input,     setInput]     = useState('')
  const [visible,   setVisible]   = useState(false)
  const [error,     setError]     = useState(false)
  const [shaking,   setShaking]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    setAuthed(stored === 'true')
  }, [])

  useEffect(() => {
    if (authed === false) inputRef.current?.focus()
  }, [authed])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === DEMO_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthed(true)
    } else {
      setError(true)
      setShaking(true)
      setInput('')
      setTimeout(() => setShaking(false), 500)
      setTimeout(() => setError(false), 2500)
    }
  }

  if (authed === null) return null
  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[360px]">

        {/* Logo + name */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="6"  cy="6"  r="3.5" fill="white" />
                <circle cx="14" cy="6"  r="3.5" fill="white" fillOpacity="0.55" />
                <circle cx="6"  cy="14" r="3.5" fill="white" fillOpacity="0.55" />
                <circle cx="14" cy="14" r="3.5" fill="white" fillOpacity="0.25" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">mesh</span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-1.5">
            Enter demo
          </h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            AI-native group chat. Password required.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className={`space-y-3 ${shaking ? 'animate-shake' : ''}`}>
            <div className="relative">
              <input
                ref={inputRef}
                id="password"
                type={visible ? 'text' : 'password'}
                value={input}
                onChange={e => { setInput(e.target.value); setError(false) }}
                placeholder="Password"
                autoComplete="off"
                className={`w-full h-10 rounded-lg border px-3 pr-10 text-[13px] bg-card text-foreground
                  placeholder:text-muted-foreground outline-none transition-all
                  focus:ring-2 focus:ring-ring/20 focus:border-ring
                  ${error ? 'border-destructive focus:ring-destructive/40' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={visible ? 'Hide password' : 'Show password'}
              >
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <p className="text-[12px] text-destructive px-0.5">
                Wrong password. Try <span className="font-medium">mesh2024</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium
                hover:opacity-90 active:scale-[0.99] transition-all shadow-sm"
            >
              Continue
            </button>
          </div>
        </form>

        {/* What to expect */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
            What you'll see
          </p>
          <ul className="space-y-2">
            {[
              'Multi-user group chat with an AI teammate',
              'AI that knows when to speak and when to stay silent',
              'Live context extraction: decisions, tasks, budget, links',
            ].map(text => (
              <li key={text} className="flex gap-2.5 text-[12px] text-muted-foreground">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{ transform:translateX(0) }
          15%    { transform:translateX(-7px) }
          35%    { transform:translateX(7px) }
          55%    { transform:translateX(-4px) }
          75%    { transform:translateX(4px) }
        }
        .animate-shake { animation: shake 0.5s ease; }
      `}</style>
    </div>
  )
}
