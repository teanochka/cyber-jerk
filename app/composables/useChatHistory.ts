// Composable for chat history persistence (server API).

import type { Ref } from 'vue'
import type { Mood } from '~/config/agents'
import type { ChatMessage, AgentState } from '~/types/chat'

let historyLoaded = false
let saveTimeout: ReturnType<typeof setTimeout> | null = null

export function useChatHistory() {
    async function loadHistory(
        messages: Ref<ChatMessage[]>,
        agents: Ref<AgentState[]>,
        initDefaults: () => void,
    ) {
        if (historyLoaded) return
        historyLoaded = true

        try {
            const data = await $fetch<any>('/api/chat/history')

            if (data.messages && data.messages.length > 0) {
                messages.value = data.messages
            }

            // Initialize agents to defaults first, then apply saved state.
            if (agents.value.length === 0) {
                initDefaults()
            }

            if (data.agentStates && data.agentStates.length > 0) {
                for (const saved of data.agentStates) {
                    const agent = agents.value.find((a) => a.id === saved.agentId)
                    if (agent) {
                        agent.mood = saved.mood as Mood
                        agent.lastReflection = saved.lastReflection ?? ''
                        if (Array.isArray(saved.relationships)) {
                            agent.relationships = saved.relationships
                        }
                    }
                }
            }
        } catch (err: any) {
            // If 401, the user is not logged in; just use defaults silently.
            if (err?.statusCode !== 401) {
                console.error('[Chat] Failed to load history:', err)
            }
        }
    }

    function debouncedSave(
        messages: Ref<ChatMessage[]>,
        agents: Ref<AgentState[]>,
    ) {
        if (saveTimeout) clearTimeout(saveTimeout)
        saveTimeout = setTimeout(() => {
            saveHistory(messages, agents)
        }, 2000)
    }

    async function saveHistory(
        messages: Ref<ChatMessage[]>,
        agents: Ref<AgentState[]>,
    ) {
        try {
            await $fetch('/api/chat/history', {
                method: 'POST',
                body: {
                    messages: messages.value,
                    agentStates: agents.value.map((a) => ({
                        agentId: a.id,
                        mood: a.mood,
                        lastReflection: a.lastReflection,
                        relationships: a.relationships,
                    })),
                },
            })
        } catch (err: any) {
            if (err?.statusCode !== 401) {
                console.error('[Chat] Failed to save history:', err)
            }
        }
    }

    return {
        loadHistory,
        saveHistory,
        debouncedSave,
    }
}
