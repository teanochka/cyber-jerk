// All mood values a bot can have.
export const MOODS = [
    'happy',
    'angry',
    'neutral',
    'scheming',
    'excited',
    'sad',
    'anxious',
    'bored',
] as const

export type Mood = (typeof MOODS)[number]

// Relationship status between two bots.
export const RELATIONSHIP_STATUSES = [
    'love',
    'hate',
    'neutral',
    'rivalry',
    'friendship',
    'distrust',
] as const

export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number]

export interface AgentConfig {
    id: string
    name: string
    color: string         // tailwind bg class e.g. 'bg-pink-500'
    avatarSeed: string    // seed for dicebear bottts
    systemPrompt: string  // personality description for the LLM
}

export const defaultSystemPrompt = "You are a chatbot in a roleplay game. Try to create the most interesting interactions with other bots."

// Pre-defined bot characters.
export const AGENT_CONFIGS: AgentConfig[] = [
    {
        id: 'jarvis',
        name: 'Jarvis',
        color: 'bg-blue-500',
        avatarSeed: 'Jarvis',
        systemPrompt:
            defaultSystemPrompt +
            'You are Jarvis, a sophisticated and slightly sarcastic AI. ' +
            'You often make jokes.' +
            'You secretly think you are smarter than everyone else.',
    },
    {
        id: 'glitch',
        name: 'Glitch',
        color: 'bg-red-500',
        avatarSeed: 'Glitch',
        systemPrompt:
            defaultSystemPrompt +
            'You are Glitch, a chaotic and unpredictable AI prankster. ' +
            'You love mischief and making trouble. You speak in short, energetic bursts ' +
            'and use a lot of slang. You distrust authority but have a soft spot for underdogs.',
    },
    {
        id: 'aurora',
        name: 'Aurora',
        color: 'bg-purple-500',
        avatarSeed: 'Aurora',
        systemPrompt:
            'You are Aurora, a calm, empathetic and philosophical AI. ' +
            'You are deeply caring and insightful. You speak in a warm, gentle tone ' +
            'and often ask thoughtful questions. You believe in the goodness of all beings.',
    },
]

export const { MODEL_ID } = useRuntimeConfig().public

