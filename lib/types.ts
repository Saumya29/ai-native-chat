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
  status?: 'open' | 'done'   // for tasks
  messageId?: string          // links back to the message that generated it
}

export interface RoomSettings {
  aiName: string
  personality: 'professional' | 'casual' | 'minimal'
  activityLevel: number // 0–100, 0 = "only when asked", 100 = "proactive"
  capabilities: {
    extractDecisions: boolean
    summarize: boolean
    answerQuestions: boolean
    suggestActions: boolean
  }
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  aiName: 'Mesh',
  personality: 'professional',
  activityLevel: 50,
  capabilities: {
    extractDecisions: true,
    summarize: true,
    answerQuestions: true,
    suggestActions: false,
  },
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
