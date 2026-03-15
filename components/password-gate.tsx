'use client'

import { useState, useEffect } from 'react'

const DEMO_PASSWORD = 'mesh2024'
const SESSION_KEY = 'mesh_auth'

interface PasswordGateProps {
  children: React.ReactNode
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    setAuthed(stored === 'true')
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === DEMO_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthed(true)
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
      setTimeout(() => setError(false), 2000)
    }
  }

  if (authed === null) return null
  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="4" cy="4" r="2.5" fill="white" />
                <circle cx="10" cy="4" r="2.5" fill="white" opacity="0.6" />
                <circle cx="4" cy="10" r="2.5" fill="white" opacity="0.6" />
                <circle cx="10" cy="10" r="2.5" fill="white" opacity="0.3" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">mesh</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground text-balance leading-snug">
            AI-native group collaboration
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Enter the demo password to explore how Mesh keeps your team aligned in real time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={shaking ? 'animate-shake' : ''}>
          <div className="space-y-3">
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1.5">
                Demo password
              </label>
              <input
                id="password"
                type="password"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter password"
                autoFocus
                autoComplete="off"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-ring ${
                  error ? 'border-destructive focus:ring-destructive/30' : 'border-border'
                }`}
              />
              {error && (
                <p className="mt-1.5 text-xs text-destructive">Incorrect password. Try again.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 hover:opacity-90 active:opacity-80 transition-opacity"
            >
              Enter demo
            </button>
          </div>
        </form>

        <div className="mt-8 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <p className="text-xs font-medium text-foreground mb-1">What you can do in this demo</p>
          <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
            <li>— Chat with Mesh, the AI team member</li>
            <li>— Switch between users to simulate a group</li>
            <li>— Watch decisions, tasks &amp; links get extracted</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.45s ease; }
      `}</style>
    </div>
  )
}
