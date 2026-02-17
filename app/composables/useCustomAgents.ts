// Composable for custom agent CRUD and localStorage persistence.

import { ref } from 'vue'
import {
    AGENT_CONFIGS,
    type AgentConfig,
    type Mood,
    type RelationshipStatus,
} from '~/config/agents'
import type { AgentState } from '~/types/chat'
import { avatarUrl } from '~/utils/agentStyles'

const CUSTOM_AGENTS_KEY = 'cyber-jerk-custom-agents'

// Singleton reactive refs.
const allAgentConfigs = ref<AgentConfig[]>([...AGENT_CONFIGS])

function loadCustomAgentsFromStorage(): AgentConfig[] {
    if (typeof localStorage === 'undefined') return []
    try {
        const raw = localStorage.getItem(CUSTOM_AGENTS_KEY)
        if (!raw) return []
        return JSON.parse(raw) as AgentConfig[]
    } catch {
        return []
    }
}

function saveCustomAgentsToStorage(customs: AgentConfig[]) {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(CUSTOM_AGENTS_KEY, JSON.stringify(customs))
}

function getCustomConfigs(): AgentConfig[] {
    return allAgentConfigs.value.filter(
        (c) => !AGENT_CONFIGS.some((d) => d.id === c.id),
    )
}

export function isCustomAgent(agentId: string): boolean {
    return !AGENT_CONFIGS.some((c) => c.id === agentId)
}

export function useCustomAgents() {
    // Initialize allAgentConfigs with built-in + custom from storage.
    function loadCustomConfigs() {
        const customs = loadCustomAgentsFromStorage()
        allAgentConfigs.value = [...AGENT_CONFIGS, ...customs]
    }

    function initAgentDefaults(): AgentState[] {
        loadCustomConfigs()

        return allAgentConfigs.value.map((cfg) => {
            const otherAgents = allAgentConfigs.value.filter((c) => c.id !== cfg.id)
            return {
                id: cfg.id,
                name: cfg.name,
                color: cfg.color,
                avatarUrl: avatarUrl(cfg.avatarSeed),
                mood: 'neutral' as Mood,
                relationships: otherAgents.map((o) => ({
                    targetId: o.id,
                    targetName: o.name,
                    status: 'neutral' as RelationshipStatus,
                })),
                lastReflection: '',
            }
        })
    }

    function createCustomAgent(
        agents: AgentState[],
        input: {
            name: string
            color: string
            avatarSeed: string
            systemPrompt: string
        },
    ): { config: AgentConfig; state: AgentState } {
        const id = `custom-${Date.now()}`
        const newConfig: AgentConfig = {
            id,
            name: input.name,
            color: input.color,
            avatarSeed: input.avatarSeed,
            systemPrompt: input.systemPrompt,
        }

        allAgentConfigs.value.push(newConfig)
        saveCustomAgentsToStorage(getCustomConfigs())

        // Build relationships for the new agent toward all existing agents.
        const newAgentState: AgentState = {
            id,
            name: input.name,
            color: input.color,
            avatarUrl: avatarUrl(input.avatarSeed),
            mood: 'neutral' as Mood,
            relationships: agents.map((a) => ({
                targetId: a.id,
                targetName: a.name,
                status: 'neutral' as RelationshipStatus,
            })),
            lastReflection: '',
        }

        // Add a relationship from every existing agent toward the new one.
        for (const existing of agents) {
            existing.relationships.push({
                targetId: id,
                targetName: input.name,
                status: 'neutral' as RelationshipStatus,
            })
        }

        return { config: newConfig, state: newAgentState }
    }

    function removeCustomAgent(
        agents: AgentState[],
        agentId: string,
    ): AgentState[] {
        // Only allow removing custom agents, not built-in ones.
        if (AGENT_CONFIGS.some((c) => c.id === agentId)) return agents

        allAgentConfigs.value = allAgentConfigs.value.filter((c) => c.id !== agentId)
        saveCustomAgentsToStorage(getCustomConfigs())

        const filtered = agents.filter((a) => a.id !== agentId)

        // Remove relationships pointing to the deleted agent.
        for (const agent of filtered) {
            agent.relationships = agent.relationships.filter(
                (r) => r.targetId !== agentId,
            )
        }

        return filtered
    }

    return {
        allAgentConfigs,
        initAgentDefaults,
        createCustomAgent,
        removeCustomAgent,
    }
}
