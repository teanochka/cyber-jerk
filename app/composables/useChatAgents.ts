import { ref } from 'vue'
import {
  AGENT_CONFIGS,
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

// ---- Singleton state ----
const messages = ref<ChatMessage[]>([])
const agents = ref<AgentState[]>([])
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

// ---- Public composable ----
export function useChatAgents() {
  if (agents.value.length === 0) {
    agents.value = AGENT_CONFIGS.map((cfg) => {
      const otherAgents = AGENT_CONFIGS.filter((c) => c.id !== cfg.id)
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

  async function initModel() {
    if (modelReady.value || modelLoading.value) return
    modelLoading.value = true
    modelProgress.value = 0
    ensureWorker()
    worker!.postMessage({ type: 'init' })
  }

  function sendUserMessage(text: string) {
    if (!text.trim()) return
    addMessage('user', 'You', text.trim(), 'bg-primary/10')
  }

  // Run one full cycle: for each agent, update mood/relationships, then generate reply.
  async function runCycle() {
    if (!modelReady.value || cycleRunning.value) return
    cycleRunning.value = true

    for (let i = 0; i < agents.value.length; i++) {
      currentAgentIndex.value = i
      const agent = agents.value[i]
      if (!agent) continue
      const config = AGENT_CONFIGS.find((c) => c.id === agent.id)
      if (!config) continue

      // Step 1: Heuristic reflection (instant, no LLM needed).
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

      // Step 2: Generate reply via LLM.
      try {
        const replyMessages = buildReplyPrompt(agent, config.systemPrompt)
        const replyRaw = await workerGenerate(replyMessages, 100)
        console.log(`[Reply ${agent.name}] raw:`, replyRaw)
        const cleaned = cleanReply(replyRaw, agent.name)
        if (cleaned) {
          addMessage(agent.id, agent.name, cleaned, agent.color)
        } else {
          // Fallback: if the model produced garbage, generate a mood-appropriate filler.
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

      // Small delay between agents for visual turn-taking.
      await new Promise((res) => setTimeout(res, 300))
    }

    currentAgentIndex.value = -1
    cycleRunning.value = false
  }

  return {
    messages,
    agents,
    modelReady,
    modelLoading,
    modelProgress,
    cycleRunning,
    currentAgentIndex,
    initModel,
    sendUserMessage,
    runCycle,
  }
}
