export interface ChatUser {
  id: string
  name: string
  initials: string
  color: string // tailwind bg class
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  userId?: string // if role === 'user'
  content: string
  timestamp: Date
}

export interface ContextItem {
  type: 'decision' | 'task' | 'link' | 'budget'
  text: string
  addedAt: Date
}

export const DEMO_USERS: ChatUser[] = [
  { id: 'alice', name: 'Alice', initials: 'A', color: 'bg-indigo-500' },
  { id: 'bob', name: 'Bob', initials: 'B', color: 'bg-emerald-500' },
  { id: 'carol', name: 'Carol', initials: 'C', color: 'bg-amber-500' },
]

export const AI_USER: ChatUser = {
  id: 'mesh-ai',
  name: 'Mesh',
  initials: 'M',
  color: 'bg-primary',
}
