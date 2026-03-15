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
      <div className="w-full max-w-[400px]">

        {/* Logo + name */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mb-5 shadow-md">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="6"  cy="6"  r="3.5" fill="white" />
              <circle cx="14" cy="6"  r="3.5" fill="white" fillOpacity="0.55" />
              <circle cx="6"  cy="14" r="3.5" fill="white" fillOpacity="0.55" />
              <circle cx="14" cy="14" r="3.5" fill="white" fillOpacity="0.25" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome to Mesh
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            AI-native collaboration — enter the demo password to continue.
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
                placeholder="Demo password"
                autoComplete="off"
                className={`w-full h-11 rounded-xl border px-4 pr-11 text-sm bg-card text-foreground
                  placeholder:text-muted-foreground outline-none transition-all
                  focus:ring-2 focus:ring-ring focus:border-ring
                  ${error ? 'border-destructive focus:ring-destructive/40' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={visible ? 'Hide password' : 'Show password'}
              >
                {visible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-destructive px-1">
                Incorrect password — try <span className="font-medium">mesh2024</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold
                hover:opacity-90 active:scale-[0.99] transition-all shadow-sm"
            >
              Enter demo
            </button>
          </div>
        </form>

        {/* What to expect */}
        <div className="mt-8 rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground">What you will see</p>
          <ul className="space-y-2.5">
            {[
              ['Group chat', 'Switch between Jordan, Marcus, and Priya to simulate a real team conversation.'],
              ['AI team member', 'Mesh participates naturally — it summarizes, asks questions, and stays aligned.'],
              ['Live context panel', 'Decisions, tasks, budget, and links get extracted automatically on the right.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="text-xs font-medium text-foreground">{title} — </span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
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
