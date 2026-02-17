import { ref } from 'vue'
import {
  AGENT_CONFIGS,
  type AgentConfig,
  type Mood,
  type RelationshipStatus,
} from '~/config/agents'
import type {
  ChatMessage,
  AgentState,
} from '~/types/chat'
import {
  determineMood,
  updateRelationships,
  generateThought,
} from '~/utils/agentHeuristics'

const CONTEXT_WINDOW = 20
const CUSTOM_AGENTS_KEY = 'cyber-jerk-custom-agents'

// ---- Singleton state ----
const messages = ref<ChatMessage[]>([])
const agents = ref<AgentState[]>([])
const allAgentConfigs = ref<AgentConfig[]>([...AGENT_CONFIGS])
const modelReady = ref(false)
const modelLoading = ref(false)
const modelProgress = ref(0)
const cycleRunning = ref(false)
const currentAgentIndex = ref(-1)

let worker: Worker | null = null
let requestId = 0
const pendingRequests = new Map<
  number,
  { resolve: (v: string) => void; reject: (e: Error) => void }
>()

// ---- Worker communication ----
function ensureWorker() {
  if (worker) return
  worker = new Worker(new URL('~/workers/llm.worker.ts', import.meta.url), {
    type: 'module',
  })
  worker.addEventListener('message', (e) => {
    const data = e.data
    if (data.type === 'init-progress') {
      modelProgress.value = data.progress ?? 0
    } else if (data.type === 'init-done') {
      modelReady.value = true
      modelLoading.value = false
      modelProgress.value = 100
    } else if (data.type === 'generate-result' && data.id != null) {
      pendingRequests.get(data.id)?.resolve(data.result ?? '')
      pendingRequests.delete(data.id)
    } else if (data.type === 'error') {
      if (data.id != null) {
        pendingRequests
          .get(data.id)
          ?.reject(new Error(data.error ?? 'Unknown worker error'))
        pendingRequests.delete(data.id)
      } else {
        console.error('[LLM Worker]', data.error)
        modelLoading.value = false
      }
    }
  })
}

function workerGenerate(chatMessages: any[], maxTokens: number): Promise<string> {
  ensureWorker()
  const id = ++requestId
  const prompt = JSON.stringify({ messages: chatMessages, maxTokens })
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject })
    worker!.postMessage({ type: 'generate', id, prompt })
  })
}

// ---- Helpers ----
function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
}

// Build conversation as proper chat turns for the model.
function buildConversationTurns(forAgentId: string, n: number = CONTEXT_WINDOW) {
  const window = messages.value.slice(-n)
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

// Build the reply prompt.
function buildReplyPrompt(agentState: AgentState, systemPrompt: string) {
  const relSummary = agentState.relationships
    .map((r) => `${r.targetName}(${r.status})`)
    .join(', ')

  // Build a mood-flavored instruction.
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

  const systemMessage = {
    role: 'system',
    content:
      `${systemPrompt}\n` +
      `${moodText}\n` +
      `Your relationships: ${relSummary || 'no strong feelings yet'}.\n` +
      'RULES: Reply with 1-2 short sentences. Stay in character. Do NOT repeat what others said. Be original.',
  }

  const turns = buildConversationTurns(agentState.id)
  return [systemMessage, ...turns]
}

// Clean up the raw reply from the model.
function cleanReply(raw: string, agentName: string): string {
  let text = raw.trim()

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

  // If the model output contains "[SomeName]:" at the start, it's echoing context.
  if (/^\[.+\]:/.test(text)) return ''

  // Detect and reject gibberish (repeated character sequences).
  if (/(.)\1{10,}/.test(text)) return ''
  if (/(\w{2,})\1{5,}/.test(text)) return ''

  // Take only the first 2 sentences to avoid runaway generation.
  const sentences = text.match(/[^.!?]+[.!?]+/g)
  if (sentences && sentences.length > 2) {
    text = sentences.slice(0, 2).join('').trim()
  }
  return text
}

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

// ---- Custom agent localStorage ----
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

// ---- Persistence ----
let historyLoaded = false
let saveTimeout: ReturnType<typeof setTimeout> | null = null

function initAgentDefaults() {
  // Merge built-in + custom configs.
  const customs = loadCustomAgentsFromStorage()
  allAgentConfigs.value = [...AGENT_CONFIGS, ...customs]

  agents.value = allAgentConfigs.value.map((cfg) => {
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

async function loadHistory() {
  if (historyLoaded) return
  historyLoaded = true

  try {
    const data = await $fetch<any>('/api/chat/history')

    if (data.messages && data.messages.length > 0) {
      messages.value = data.messages
    }

    // Initialize agents to defaults first, then apply saved state.
    if (agents.value.length === 0) {
      initAgentDefaults()
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

function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveHistory()
  }, 2000)
}

async function saveHistory() {
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

// ---- Public composable ----
export function useChatAgents() {
  if (agents.value.length === 0) {
    initAgentDefaults()
  }

  // Load history from DB on first use (client-side only).
  if (import.meta.client && !historyLoaded) {
    loadHistory()
  }

  async function initModel() {
    if (modelReady.value || modelLoading.value) return
    modelLoading.value = true
    modelProgress.value = 0
    ensureWorker()

    const config = useRuntimeConfig().public
    worker!.postMessage({
      type: 'init',
      config: {
        MODEL_ID: config.MODEL_ID,
        max_tokens: config.max_tokens,
      },
    })
  }

  function sendUserMessage(text: string) {
    if (!text.trim()) return
    addMessage('user', 'You', text.trim(), 'bg-primary/10')
    debouncedSave()
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
        const replyMessages = buildReplyPrompt(agent, config.systemPrompt)
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
    saveHistory()
  }

  function createCustomAgent(input: {
    name: string
    color: string
    avatarSeed: string
    systemPrompt: string
  }) {
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
      relationships: agents.value.map((a) => ({
        targetId: a.id,
        targetName: a.name,
        status: 'neutral' as RelationshipStatus,
      })),
      lastReflection: '',
    }

    // Add a relationship from every existing agent toward the new one.
    for (const existing of agents.value) {
      existing.relationships.push({
        targetId: id,
        targetName: input.name,
        status: 'neutral' as RelationshipStatus,
      })
    }

    agents.value.push(newAgentState)
    debouncedSave()
  }

  function removeCustomAgent(agentId: string) {
    // Only allow removing custom agents, not built-in ones.
    if (AGENT_CONFIGS.some((c) => c.id === agentId)) return

    allAgentConfigs.value = allAgentConfigs.value.filter((c) => c.id !== agentId)
    saveCustomAgentsToStorage(getCustomConfigs())

    agents.value = agents.value.filter((a) => a.id !== agentId)

    // Remove relationships pointing to the deleted agent.
    for (const agent of agents.value) {
      agent.relationships = agent.relationships.filter(
        (r) => r.targetId !== agentId,
      )
    }
    debouncedSave()
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

