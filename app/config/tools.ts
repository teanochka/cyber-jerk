// Tool definitions for bot function calling.
// These are injected into the system prompt so the LLM can choose to call them.

import { MOODS, RELATIONSHIP_STATUSES } from '~/config/agents'

export interface ToolCall {
    name: string
    arguments: Record<string, string>
}

export const TOOL_DEFINITIONS = [
    {
        name: 'update_state',
        description: 'Update your current mood and relationships with other bots.',
        parameters: {
            mood: {
                type: 'string',
                enum: [...MOODS],
                description: 'The new mood to adopt',
            },
            relationships: {
                type: 'object',
                description: 'Map of BotName -> Status (love, hate, neutral, etc.)',
            },
        },
    },
]

// Build a human-readable tool description for the system prompt.
export function buildToolPrompt(): string {
    const lines = ['TOOLS: You can use these tools by outputting a JSON object with an "action" field:']

    for (const tool of TOOL_DEFINITIONS) {
        const args = Object.entries(tool.parameters).map(([k, v]) => {
            const opts = 'enum' in v ? ` (${(v as any).enum.join('|')})` : ''
            return `${k}: ${v.description}${opts}`
        }).join(', ')
        lines.push(`- ${tool.name}: { action: "${tool.name}", ${args} }`)
    }

    lines.push('Example: { "action": "set_mood", "mood": "happy" }')
    lines.push('Example (no change): { "action": "keep_mood" }')
    return lines.join('\n')
}

// Try to extract a tool call from the raw LLM output.
// Returns null if no valid tool call is found.
export function parseToolCall(raw: string): ToolCall | null {
    // Look for JSON inside ```json fences first.
    const fencedMatch = raw.match(/```json\s*([\s\S]*?)```/)
    if (fencedMatch) {
        return tryParseJson(fencedMatch[1]!)
    }

    // Fallback: look for any JSON object in the text.
    const jsonMatch = raw.match(/\{[\s\S]*?"action"\s*:[\s\S]*?\}/)
    if (jsonMatch) {
        return tryParseJson(jsonMatch[0])
    }

    return null
}

function tryParseJson(text: string): ToolCall | null {
    try {
        const obj = JSON.parse(text.trim())
        if (obj && typeof obj.action === 'string') {
            const { action, ...args } = obj
            return { name: action, arguments: args }
        }
    } catch {
        // Not valid JSON.
    }
    return null
}

// Strip the JSON block from the raw output to get only the text portion.
export function stripToolCallFromText(raw: string): string {
    let text = raw
    // Remove fenced JSON blocks.
    text = text.replace(/```json\s*[\s\S]*?```/g, '')
    // Remove unfenced JSON objects that look like tool calls.
    text = text.replace(/\{[\s\S]*?"action"\s*:[\s\S]*?\}/g, '')
    return text.trim()
}
