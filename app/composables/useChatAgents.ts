// Orchestrator composable -- thin wrapper that combines the focused modules.

import { ref } from 'vue'
import type { ChatMessage, AgentState } from '~/types/chat'
import type { Mood, RelationshipStatus } from '~/config/agents'
import { useWorker } from '~/composables/useWorker'
import { useCustomAgents } from '~/composables/useCustomAgents'
import { useChatHistory } from '~/composables/useChatHistory'
import { buildReplyPrompt, cleanReply } from '~/utils/promptBuilder'
import { determineMood, updateRelationships } from '~/utils/agentHeuristics'

// Singleton state.
const messages = ref<ChatMessage[]>([])
const agents = ref<AgentState[]>([])
const cycleRunning = ref(false)
const isAutoRunning = ref(false)
const simulationSpeed = ref(80)
const currentAgentIndex = ref(-1)

const {
  modelReady,
  modelLoading,
  modelProgress,
  initModel,
  workerGenerate,
} = useWorker()

const {
  allAgentConfigs,
  initAgentDefaults,
  createCustomAgent: createCustomAgentRaw,
  removeCustomAgent: removeCustomAgentRaw,
} = useCustomAgents()

const {
  loadHistory,
  saveHistory,
  debouncedSave,
} = useChatHistory()

let initialized = false

function addMessage(
  sender: string,
  senderName: string,
  text: string,
  color: string,
) {
  messages.value.push({
    id: Date.now() + Math.random(),
    sender,
    senderName,
    text,
    timestamp: Date.now(),
    color,
  })
}

function doInitDefaults(customConfigs?: any[]) {
  agents.value = initAgentDefaults(customConfigs)
}

// Execute logic based on text analysis using heuristics.
function analyzeAndExecute(agent: AgentState, _lastMessageText: string) {
  // 1. Mood Analysis
  const newMood = determineMood(agent.id, agent.mood, messages.value)
  if (newMood !== agent.mood) {
    console.log(`[Heuristics] ${agent.name} mood: ${agent.mood} -> ${newMood}`)
    agent.mood = newMood
  }

  // 2. Relationship Analysis
  const updatedRels = updateRelationships(agent, messages.value)
  // Check for changes to log them? updateRelationships logs them internally now.
  agent.relationships = updatedRels
}

export function useChatAgents() {
  if (!initialized) {
    initialized = true
    doInitDefaults()

    // Load history from DB on first use (client-side only).
    if (import.meta.client) {
      loadHistory(messages, agents, allAgentConfigs, doInitDefaults)
    }
  }

  function sendUserMessage(text: string) {
    if (!text.trim()) return
    addMessage('user', 'You', text.trim(), 'bg-primary/10')
    debouncedSave(messages, agents, allAgentConfigs)
  }

  async function toggleAutoRun() {
    if (cycleRunning.value) {
      isAutoRunning.value = !isAutoRunning.value
    } else {
      isAutoRunning.value = true
      await runCycle()
    }
  }

  async function runCycle() {
    if (!modelReady.value || cycleRunning.value) return
    cycleRunning.value = true

    try {
      do {
        for (let i = 0; i < agents.value.length; i++) {
          if (!isAutoRunning.value && i === 0) {
            // stop if flag turned off
          }
          // Check again to break inner loop
          if (!isAutoRunning.value) break

          currentAgentIndex.value = i
          const agent = agents.value[i]
          if (!agent) continue
          const config = allAgentConfigs.value.find((c) => c.id === agent.id)
          if (!config) continue

          try {
            const replyMessages = buildReplyPrompt(messages.value, agent, config.systemPrompt)
            console.log(`[Prompt ${agent.name}]`, JSON.stringify(replyMessages, null, 2))

            const replyRaw = await workerGenerate(replyMessages, 60)
            console.log(`[${agent.name}] raw output:`, replyRaw)

            // Clean the reply
            const cleaned = cleanReply(replyRaw, agent.name)

            if (cleaned) {
              addMessage(agent.id, agent.name, cleaned, agent.color)
              // Analyze including the new message
              analyzeAndExecute(agent, cleaned)
            } else {
              // Fallback filler if empty
              const fillers: Record<string, string[]> = {
                happy: ['Ha, this is fun!', 'I like where this is going.'],
                angry: ['Hmph.', 'I do not appreciate that.'],
                neutral: ['Interesting.', 'I see.'],
                scheming: ['Noted...', 'How intriguing.'],
                excited: ['This is amazing!', 'Tell me more!'],
                sad: ['*sighs*', 'If you say so...'],
                anxious: ['Um, okay...', 'I am not sure about this.'],
                bored: ['*yawns*', 'Can we move on?'],
              }
              const options = fillers[agent.mood] ?? fillers.neutral!
              const filler = options[Math.floor(Math.random() * options.length)]!
              addMessage(agent.id, agent.name, filler, agent.color)
              analyzeAndExecute(agent, filler)
            }
          } catch (err) {
            console.error(`[Reply ${agent.name}]`, err)
          }

          await new Promise((res) => setTimeout(res, 500))
        }

        // Save state after the full cycle completes.
        saveHistory(messages, agents, allAgentConfigs)

        if (isAutoRunning.value) {
          // Calculate delay: 0% = 20000ms, 100% = 500ms
          const minDelay = 500
          const maxDelay = 20000
          const speedFactor = simulationSpeed.value / 100
          const delay = maxDelay - (speedFactor * (maxDelay - minDelay))
          await new Promise((res) => setTimeout(res, delay))
        }

      } while (isAutoRunning.value && modelReady.value)

    } finally {
      currentAgentIndex.value = -1
      cycleRunning.value = false
      if (!modelReady.value) isAutoRunning.value = false
    }
  }

  function createCustomAgent(input: {
    name: string
    color: string
    avatarSeed: string
    systemPrompt: string
  }) {
    const { state } = createCustomAgentRaw(agents.value, input)
    agents.value.push(state)
    debouncedSave(messages, agents, allAgentConfigs)
  }

  function removeCustomAgent(agentId: string) {
    agents.value = removeCustomAgentRaw(agents.value, agentId)
    debouncedSave(messages, agents, allAgentConfigs)
  }

  return {
    messages,
    agents,
    allAgentConfigs,
    modelReady,
    modelLoading,
    modelProgress,
    cycleRunning,
    isAutoRunning,
    simulationSpeed,
    currentAgentIndex,
    initModel,
    sendUserMessage,
    runCycle,
    toggleAutoRun,
    createCustomAgent,
    removeCustomAgent,
  }
}
