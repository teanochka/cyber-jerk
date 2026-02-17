import type { Mood, RelationshipStatus } from '~/config/agents'

export interface ChatMessage {
    id: number
    sender: string       // agent id or 'user'
    senderName: string
    text: string
    timestamp: number
    color: string        // tailwind bg class for the bubble
}

// Relationship from one agent to another.
export interface Relationship {
    targetId: string
    targetName: string
    status: RelationshipStatus
}

// Internal reflection (visible only to the user, not to other bots).
export interface Reflection {
    mood: Mood
    status: string           // short internal monologue about plans
    relationships: Relationship[]
}

// Full runtime state for a single agent.
export interface AgentState {
    id: string
    name: string
    color: string
    avatarUrl: string
    mood: Mood
    relationships: Relationship[]
    lastReflection: string   // last internal status text
}

// Message sent from the main thread to the worker.
export interface WorkerRequest {
    type: 'init' | 'generate'
    id?: number              // unique request id
    prompt?: string
}

// Message sent from the worker back to the main thread.
export interface WorkerResponse {
    type: 'init-progress' | 'init-done' | 'generate-result' | 'error'
    id?: number
    progress?: number        // 0-100
    result?: string
    error?: string
}
