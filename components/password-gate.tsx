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
      setTimeout(() => setShaking(false), 500)
      setTimeout(() => setError(false), 2000)
    }
  }

  if (authed === null) return null

  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-sm px-4">
        {/* Logo / wordmark */}
        <div className="mb-10 text-center">
          <span className="text-2xl font-semibold tracking-tight text-foreground">mesh</span>
          <p className="mt-1 text-sm text-muted-foreground">AI-native group collaboration</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`flex flex-col gap-3 ${shaking ? 'animate-shake' : ''}`}
        >
          <input
            type="password"
            placeholder="Enter demo password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            className={`w-full rounded-lg border px-4 py-3 text-sm bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-colors ${
              error ? 'border-destructive' : 'border-border'
            }`}
          />
          {error && (
            <p className="text-xs text-destructive text-center">Incorrect password</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium py-3 hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo access only &mdash; no account required
        </p>
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
