'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Square, SkipForward } from 'lucide-react'
import { DEMO_SCRIPT, type DemoStep } from '@/lib/demo-script'
import { type ChatMessage, type ContextItem, DEMO_USERS } from '@/lib/types'

interface DemoPlayerProps {
  onMessage: (msg: ChatMessage) => void
  onContextItems: (items: ContextItem[]) => void
  onSilent: () => void
  onReveal: () => void
  onStart: () => void
  onEnd: () => void
  isActive: boolean
  nextId: () => string
}

export function DemoPlayer({
  onMessage,
  onContextItems,
  onSilent,
  onReveal,
  onStart,
  onEnd,
  isActive,
  nextId,
}: DemoPlayerProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playingRef = useRef(false)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const executeStep = useCallback(
    (step: DemoStep) => {
      if (step.type === 'silent') {
        onSilent()
      } else if (step.type === 'reveal') {
        onReveal()
      } else if (step.type === 'user') {
        onMessage({
          id: nextId(),
          role: 'user',
          userId: step.userId,
          content: step.content,
          timestamp: new Date(),
        })
      } else if (step.type === 'ai') {
        onMessage({
          id: nextId(),
          role: 'ai',
          content: step.content,
          timestamp: new Date(),
        })
      }

      if (step.contextItems?.length) {
        onContextItems(
          step.contextItems.map(ci => ({
            ...ci,
            addedAt: new Date(),
          }))
        )
      }
    },
    [onMessage, onContextItems, onSilent, onReveal, nextId]
  )

  const playStep = useCallback(
    (index: number) => {
      if (index >= DEMO_SCRIPT.length) {
        setPlaying(false)
        onEnd()
        return
      }

      const step = DEMO_SCRIPT[index]

      const execute = () => {
        if (!playingRef.current) return
        executeStep(step)
        setStepIndex(index + 1)
        playStep(index + 1)
      }

      if (step.delay > 0) {
        timeoutRef.current = setTimeout(execute, step.delay)
      } else {
        execute()
      }
    },
    [executeStep, onEnd]
  )

  const start = useCallback(() => {
    setPlaying(true)
    setStepIndex(0)
    onStart()
    timeoutRef.current = setTimeout(() => playStep(0), 500)
  }, [onStart, playStep])

  const stop = useCallback(() => {
    clearTimer()
    setPlaying(false)
    onEnd()
  }, [clearTimer, onEnd])

  const skip = useCallback(() => {
    clearTimer()
    const step = DEMO_SCRIPT[stepIndex]
    if (!step) return

    executeStep(step)

    const next = stepIndex + 1
    setStepIndex(next)
    if (next >= DEMO_SCRIPT.length) {
      setPlaying(false)
      onEnd()
    } else {
      playStep(next)
    }
  }, [stepIndex, clearTimer, executeStep, onEnd, playStep])

  useEffect(() => clearTimer, [clearTimer])

  if (!isActive && !playing) {
    return (
      <button
        onClick={start}
        className="flex items-center gap-2 text-[11.5px] font-medium text-primary border border-primary/30
          bg-primary/5 hover:bg-primary/10 rounded-lg px-3 py-1.5 transition-colors"
      >
        <Play size={12} />
        Watch Demo
      </button>
    )
  }

  if (playing) {
    const progress = Math.round((stepIndex / DEMO_SCRIPT.length) * 100)
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-medium text-muted-foreground">
            Demo playing
          </span>
        </div>
        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={skip}
          className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground
            hover:text-foreground hover:bg-secondary transition-colors"
          title="Skip to next"
        >
          <SkipForward size={12} />
        </button>
        <button
          onClick={stop}
          className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground
            hover:text-foreground hover:bg-secondary transition-colors"
          title="Stop demo"
        >
          <Square size={12} />
        </button>
      </div>
    )
  }

  return null
}
