// Composable for chat history persistence (server API).
// Now also syncs custom agent configs to the database.

import type { Ref } from 'vue'
import type { AgentConfig, Mood } from '~/config/agents'
import type { ChatMessage, AgentState } from '~/types/chat'

let historyLoaded = false
let saveTimeout: ReturnType<typeof setTimeout> | null = null

export function useChatHistory() {
    async function loadHistory(
        messages: Ref<ChatMessage[]>,
        agents: Ref<AgentState[]>,
        allAgentConfigs: Ref<AgentConfig[]>,
        initDefaults: (customConfigs?: AgentConfig[]) => void,
    ) {
        if (historyLoaded) return
        historyLoaded = true

        try {
            const data = await $fetch<any>('/api/chat/history')

            // Load custom agent configs from the DB before initializing agents.
            const dbCustomAgents: AgentConfig[] = (data.customAgents ?? []).map((c: any) => ({
                id: c.id,
                name: c.name,
                color: c.color,
                avatarSeed: c.avatarSeed,
                systemPrompt: c.systemPrompt,
            }))

            // Initialize agents with the DB-sourced custom configs.
            initDefaults(dbCustomAgents)

            if (data.messages && data.messages.length > 0) {
                messages.value = data.messages
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
        allAgentConfigs: Ref<AgentConfig[]>,
    ) {
        if (saveTimeout) clearTimeout(saveTimeout)
        saveTimeout = setTimeout(() => {
            saveHistory(messages, agents, allAgentConfigs)
        }, 2000)
    }

    async function saveHistory(
        messages: Ref<ChatMessage[]>,
        agents: Ref<AgentState[]>,
        allAgentConfigs: Ref<AgentConfig[]>,
    ) {
        // Extract only custom agents (those not in the built-in list).
        const { AGENT_CONFIGS } = await import('~/config/agents')
        const customConfigs = allAgentConfigs.value.filter(
            (c) => !AGENT_CONFIGS.some((d) => d.id === c.id),
        )

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
                    customAgents: customConfigs.map((c) => ({
                        id: c.id,
                        name: c.name,
                        color: c.color,
                        avatarSeed: c.avatarSeed,
                        systemPrompt: c.systemPrompt,
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
