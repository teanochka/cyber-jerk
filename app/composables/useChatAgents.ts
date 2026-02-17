// Orchestrator composable -- thin wrapper that combines the focused modules.

import { ref } from 'vue'
import type { ChatMessage, AgentState } from '~/types/chat'
import { useWorker } from '~/composables/useWorker'
import { useCustomAgents } from '~/composables/useCustomAgents'
import { useChatHistory } from '~/composables/useChatHistory'
import { buildReplyPrompt, cleanReply } from '~/utils/promptBuilder'
import {
  determineMood,
  updateRelationships,
  generateThought,
} from '~/utils/agentHeuristics'

// Singleton state.
const messages = ref<ChatMessage[]>([])
const agents = ref<AgentState[]>([])
const cycleRunning = ref(false)
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

function doInitDefaults() {
  agents.value = initAgentDefaults()
}

export function useChatAgents() {
  if (!initialized) {
    initialized = true
    doInitDefaults()

    // Load history from DB on first use (client-side only).
    if (import.meta.client) {
      loadHistory(messages, agents, doInitDefaults)
    }
  }

  function sendUserMessage(text: string) {
    if (!text.trim()) return
    addMessage('user', 'You', text.trim(), 'bg-primary/10')
    debouncedSave(messages, agents)
  }

  async function runCycle() {
    if (!modelReady.value || cycleRunning.value) return
    cycleRunning.value = true

    for (let i = 0; i < agents.value.length; i++) {
      currentAgentIndex.value = i
      const agent = agents.value[i]
      if (!agent) continue
      const config = allAgentConfigs.value.find((c) => c.id === agent.id)
      if (!config) continue

      const prevMood = agent.mood
      agent.mood = determineMood(agent.id, agent.mood, messages.value)
      agent.relationships = updateRelationships(agent, messages.value)
      agent.lastReflection = generateThought(
        agent.name,
        agent.mood,
        prevMood,
        agent.relationships,
      )
      console.log(`[${agent.name}] mood: ${prevMood} -> ${agent.mood} | thought: ${agent.lastReflection}`)

      try {
        const replyMessages = buildReplyPrompt(messages.value, agent, config.systemPrompt)
        const replyRaw = await workerGenerate(replyMessages, 100)
        console.log(`[Reply ${agent.name}] raw:`, replyRaw)
        const cleaned = cleanReply(replyRaw, agent.name)
        if (cleaned) {
          addMessage(agent.id, agent.name, cleaned, agent.color)
        } else {
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
        }
      } catch (err) {
        console.error(`[Reply ${agent.name}]`, err)
      }

      await new Promise((res) => setTimeout(res, 300))
    }

    currentAgentIndex.value = -1
    cycleRunning.value = false

    // Save state after the full cycle completes.
    saveHistory(messages, agents)
  }

  function createCustomAgent(input: {
    name: string
    color: string
    avatarSeed: string
    systemPrompt: string
  }) {
    const { state } = createCustomAgentRaw(agents.value, input)
    agents.value.push(state)
    debouncedSave(messages, agents)
  }

  function removeCustomAgent(agentId: string) {
    agents.value = removeCustomAgentRaw(agents.value, agentId)
    debouncedSave(messages, agents)
  }

  return {
    messages,
    agents,
    allAgentConfigs,
    modelReady,
    modelLoading,
    modelProgress,
    cycleRunning,
    currentAgentIndex,
    initModel,
    sendUserMessage,
    runCycle,
    createCustomAgent,
    removeCustomAgent,
  }
}
