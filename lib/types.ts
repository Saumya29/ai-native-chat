export interface ChatUser {
  id: string
  name: string
  initials: string
  color: string // tailwind bg class
  role: string  // job title shown in the demo
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  userId?: string
  content: string
  timestamp: Date
}

export interface ContextItem {
  type: 'decision' | 'task' | 'link' | 'budget'
  text: string
  addedAt: Date
}

export const DEMO_USERS: ChatUser[] = [
  { id: 'jordan', name: 'Jordan',  initials: 'JK', color: 'bg-violet-500',  role: 'Product Manager' },
  { id: 'marcus', name: 'Marcus',  initials: 'MR', color: 'bg-emerald-500', role: 'Engineering Lead' },
  { id: 'priya',  name: 'Priya',   initials: 'PS', color: 'bg-rose-500',    role: 'Design Lead' },
]

export const AI_USER: ChatUser = {
  id:       'mesh-ai',
  name:     'Mesh',
  initials: 'AI',
  color:    'bg-primary',
  role:     'AI Collaborator',
}
