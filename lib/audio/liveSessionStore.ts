import { randomUUID } from 'node:crypto'

export interface LiveSessionState {
  id: string
  createdAt: number
  chunks: number
  lastActivity: number
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
}

const globalStore = globalThis as unknown as { __voiceLiveSessions?: Map<string, LiveSessionState> }

if (!globalStore.__voiceLiveSessions) {
  globalStore.__voiceLiveSessions = new Map()
}

const store = globalStore.__voiceLiveSessions

export function createLiveSession() {
  const id = randomUUID()
  const state: LiveSessionState = {
    id,
    createdAt: Date.now(),
    chunks: 0,
    lastActivity: Date.now(),
    messages: [
      {
        role: 'system',
        content:
          'You are Dadnoos voice assistant. Reply in fluent Persian and keep responses concise.',
      },
    ],
  }
  store.set(id, state)
  return state
}

export function getLiveSession(id: string) {
  return store.get(id)
}

export function touchLiveSession(id: string) {
  const session = store.get(id)
  if (session) {
    session.lastActivity = Date.now()
  }
}

export function incrementChunks(id: string) {
  const session = store.get(id)
  if (session) {
    session.chunks += 1
    session.lastActivity = Date.now()
  }
}

export function appendUserMessage(id: string, content: string) {
  const session = store.get(id)
  if (session) {
    session.messages.push({ role: 'user', content })
    session.lastActivity = Date.now()
  }
}

export function appendAssistantMessage(id: string, content: string) {
  const session = store.get(id)
  if (session) {
    session.messages.push({ role: 'assistant', content })
    session.lastActivity = Date.now()
  }
}

export function endLiveSession(id: string) {
  const session = store.get(id)
  if (session) {
    store.delete(id)
  }
  return session
}

export function pruneInactiveSessions(timeoutMs = 60_000) {
  const now = Date.now()
  for (const [id, session] of store.entries()) {
    if (now - session.lastActivity > timeoutMs) {
      store.delete(id)
    }
  }
}
