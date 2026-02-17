// Pure functions for building LLM prompts and cleaning replies.
// No reactivity -- these are prompt-engineering utilities.

import type { AgentState } from '~/types/chat'
import type { ChatMessage } from '~/types/chat'
import { MOODS, RELATIONSHIP_STATUSES } from '~/config/agents'

const CONTEXT_WINDOW = 6

// Build conversation as proper chat turns for the model.
export function buildConversationTurns(
    messages: ChatMessage[],
    forAgentId: string,
    n: number = CONTEXT_WINDOW,
) {
    const window = messages.slice(-n)
    const turns: { role: string; content: string }[] = []

    for (const m of window) {
        if (m.sender === forAgentId) {
            turns.push({ role: 'assistant', content: m.text })
        } else {
            turns.push({ role: 'user', content: `${m.senderName}: ${m.text}` })
        }
    }
    return turns
}

// Build the full reply prompt (system message + conversation turns).
export function buildReplyPrompt(
    messages: ChatMessage[],
    agentState: AgentState,
    systemPrompt: string,
) {
    const relSummary = agentState.relationships
        .map((r) => `${r.targetName}(${r.status})`)
        .join(', ')

    const moodInstructions: Record<string, string> = {
        happy: 'You feel cheerful and upbeat right now.',
        angry: 'You feel irritated and confrontational right now. Show it in your tone.',
        neutral: 'You feel calm and composed.',
        scheming: 'You feel cunning and secretive. Drop hints about hidden plans.',
        excited: 'You feel very energetic and enthusiastic!',
        sad: 'You feel melancholic and subdued. Your tone is quieter.',
        anxious: 'You feel worried and nervous. Show some uncertainty.',
        bored: 'You feel uninterested. Your responses are more dismissive or dry.',
    }

    const moodText = moodInstructions[agentState.mood] ?? 'You feel neutral.'

    const otherBotNames = agentState.relationships
        .map((r) => r.targetName)
        .join(', ')

    const systemMessage = {
        role: 'system',
        content:
            `Your name is ${agentState.name}. You are ${systemPrompt}. Your current mood is: ${agentState.mood}. Your relationships: ${relSummary || 'no strong feelings yet'}.
            INSTRUCTIONS:
            - Write a SHORT response (under 2 sentences).
            - Stay in character based on your mood.
            `,
    }

    const turns = buildConversationTurns(messages, agentState.id)
    return [systemMessage, ...turns]
}

// Clean up the raw reply from the model.
// Now also strips out JSON tool call blocks, leaving only the spoken text.
export function cleanReply(raw: string, agentName: string): string {
    // First strip any tool call JSON from the text.
    let text = raw.trim()

    // Remove fenced JSON blocks.
    text = text.replace(/```json\s*[\s\S]*?```/g, '')
    // Remove unfenced JSON objects.
    text = text.replace(/\{[\s\S]*?("action"|action)\s*:[\s\S]*?\}/g, '')

    // Remove markdown bold/italic/headers
    text = text.replace(/[*#_]+/g, '')

    text = text.trim()

    // Strip name prefix.
    const prefixPattern = new RegExp(`^${agentName}\\s*:\\s*`, 'i')
    text = text.replace(prefixPattern, '')

    // Strip "Recent chat:" or context echoes.
    if (text.toLowerCase().startsWith('recent chat')) {
        const newlineIdx = text.indexOf('\n')
        if (newlineIdx > 0) text = text.slice(newlineIdx + 1).trim()
        else return ''
    }

    // Strip leading/trailing quotes.
    text = text.replace(/^["']|["']$/g, '')

    // Echo detection
    if (/^\[.+\]:/.test(text)) return ''

    // Gibberish detection
    if (/(.)\\1{10,}/.test(text)) return '' // Repeated chars
    if (/(\w{2,})\1{5,}/.test(text)) return '' // Repeated words

    // Length sanity check: if a single "word" is > 30 chars, it's garbage
    if (text.split(/\s+/).some(w => w.length > 30)) return ''

    // Force truncation after 2 sentences.
    // This stops the "rambling" behavior where it generates 500 words of nonsense.
    const sentences = text.match(/[^.!?]+[.!?]+/g)
    if (sentences && sentences.length > 0) {
        // Take max 2 sentences.
        text = sentences.slice(0, 2).join(' ').trim()
    } else {
        // If no punctuation found, just take the first 150 chars.
        if (text.length > 150) text = text.slice(0, 150) + '...'
    }

    return text
}
