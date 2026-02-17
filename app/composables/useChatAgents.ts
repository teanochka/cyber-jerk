// Orchestrator composable -- thin wrapper that combines the focused modules.

import { ref } from 'vue'
import type { ChatMessage, AgentState } from '~/types/chat'
import type { Mood, RelationshipStatus } from '~/config/agents'
import { useWorker } from '~/composables/useWorker'
import { useCustomAgents } from '~/composables/useCustomAgents'
import { useChatHistory } from '~/composables/useChatHistory'
import { buildReplyPrompt, cleanReply } from '~/utils/promptBuilder'
import { parseToolCall } from '~/config/tools'

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

function doInitDefaults(customConfigs?: any[]) {
  agents.value = initAgentDefaults(customConfigs)
}

// Execute a tool call returned by the LLM.
function executeToolCall(
  agent: AgentState,
  toolName: string,
  args: Record<string, string>,
) {
  if (toolName === 'update_state') {
    const newMood = args.mood as Mood
    if (newMood && newMood !== agent.mood) {
      console.log(`[Tool] ${agent.name} mood: ${agent.mood} -> ${newMood}`)
      agent.mood = newMood
    }
    const rels = args.relationships as unknown as Record<string, string>
    if (rels) {
      for (const [targetName, status] of Object.entries(rels)) {
        const rel = agent.relationships.find(
          (r) => r.targetName.toLowerCase() === targetName.toLowerCase(),
        )
        if (rel && rel.status !== status) {
          console.log(`[Tool] ${agent.name}: ${targetName} ${rel.status} -> ${status}`)
          rel.status = status as RelationshipStatus
        }
      }
    }
  } else if (toolName === 'set_mood') {
    const newMood = args.mood as Mood
    if (newMood && newMood !== agent.mood) {
      const prevMood = agent.mood
      agent.mood = newMood
      console.log(`[Tool] ${agent.name} mood: ${prevMood} -> ${newMood}`)
    }
  } else if (toolName === 'set_relationship') {
    const targetName = args.target_name
    const newStatus = args.status as RelationshipStatus
    if (targetName && newStatus) {
      const rel = agent.relationships.find(
        (r) => r.targetName.toLowerCase() === targetName.toLowerCase(),
      )
      if (rel && rel.status !== newStatus) {
        const prevStatus = rel.status
        rel.status = newStatus
        console.log(`[Tool] ${agent.name}: ${targetName} ${prevStatus} -> ${newStatus}`)
      }
    }
  }
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

  async function runCycle() {
    if (!modelReady.value || cycleRunning.value) return
    cycleRunning.value = true

    for (let i = 0; i < agents.value.length; i++) {
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

        // Check if the LLM made a tool call.
        const toolCall = parseToolCall(replyRaw)
        if (toolCall) {
          executeToolCall(agent, toolCall.name, toolCall.arguments)
        }

        // Extract the text portion (with tool JSON stripped out).
        const cleaned = cleanReply(replyRaw, agent.name)
        if (cleaned) {
          addMessage(agent.id, agent.name, cleaned, agent.color)
        } else if (!toolCall) {
          // No text and no tool call -- use a filler based on current mood.
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
        // If there was a tool call but no text, the agent acted silently (mood/relationship changed).
        // The UI will reflect this through the debug panel state update.
      } catch (err) {
        console.error(`[Reply ${agent.name}]`, err)
      }

      await new Promise((res) => setTimeout(res, 300))
    }

    currentAgentIndex.value = -1
    cycleRunning.value = false

    // Save state after the full cycle completes.
    saveHistory(messages, agents, allAgentConfigs)
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
    currentAgentIndex,
    initModel,
    sendUserMessage,
    runCycle,
    createCustomAgent,
    removeCustomAgent,
  }
}
