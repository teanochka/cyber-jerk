<script setup lang="ts">
definePageMeta({
  layout: false,
})
import { ref, nextTick, watch, computed } from 'vue'
import { useChatAgents } from '~/composables/useChatAgents'
import { AGENT_CONFIGS } from '~/config/agents'

const {
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
  createCustomAgent,
  removeCustomAgent,
} = useChatAgents()

const newMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const showDebug = ref(true)

// -- Bot creation form state --
const showCreateForm = ref(false)
const newBotName = ref('')
const newBotPrompt = ref('')
const newBotAvatarSeed = ref('')
const newBotColor = ref('bg-pink-500')

const colorOptions = [
  { value: 'bg-pink-500', label: 'Pink', preview: '#ec4899' },
  { value: 'bg-rose-500', label: 'Rose', preview: '#f43f5e' },
  { value: 'bg-red-500', label: 'Red', preview: '#ef4444' },
  { value: 'bg-orange-500', label: 'Orange', preview: '#f97316' },
  { value: 'bg-amber-500', label: 'Amber', preview: '#f59e0b' },
  { value: 'bg-yellow-500', label: 'Yellow', preview: '#eab308' },
  { value: 'bg-lime-500', label: 'Lime', preview: '#84cc16' },
  { value: 'bg-green-500', label: 'Green', preview: '#22c55e' },
  { value: 'bg-emerald-500', label: 'Emerald', preview: '#10b981' },
  { value: 'bg-teal-500', label: 'Teal', preview: '#14b8a6' },
  { value: 'bg-cyan-500', label: 'Cyan', preview: '#06b6d4' },
  { value: 'bg-sky-500', label: 'Sky', preview: '#0ea5e9' },
  { value: 'bg-blue-500', label: 'Blue', preview: '#3b82f6' },
  { value: 'bg-indigo-500', label: 'Indigo', preview: '#6366f1' },
  { value: 'bg-violet-500', label: 'Violet', preview: '#8b5cf6' },
  { value: 'bg-purple-500', label: 'Purple', preview: '#a855f7' },
  { value: 'bg-fuchsia-500', label: 'Fuchsia', preview: '#d946ef' },
]

const avatarPreviewUrl = computed(() => {
  const seed = newBotAvatarSeed.value.trim() || 'default'
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
})

function randomizeSeed() {
  newBotAvatarSeed.value = Math.random().toString(36).substring(2, 10)
}

function isCustomAgent(agentId: string): boolean {
  return !AGENT_CONFIGS.some((c) => c.id === agentId)
}

function resetForm() {
  newBotName.value = ''
  newBotPrompt.value = ''
  newBotAvatarSeed.value = ''
  newBotColor.value = 'bg-pink-500'
}

function handleCreateBot() {
  if (!newBotName.value.trim() || !newBotPrompt.value.trim()) return
  createCustomAgent({
    name: newBotName.value.trim(),
    systemPrompt: newBotPrompt.value.trim(),
    avatarSeed: newBotAvatarSeed.value.trim() || newBotName.value.trim(),
    color: newBotColor.value,
  })
  resetForm()
  showCreateForm.value = false
}

function handleSend() {
  if (!newMessage.value.trim()) return
  sendUserMessage(newMessage.value)
  newMessage.value = ''
}

async function handleAct() {
  await runCycle()
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

// Auto-scroll to bottom when new messages appear.
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  },
)

// Mood badge color mapping.
function moodColor(mood: string): string {
  const map: Record<string, string> = {
    happy: 'bg-green-500/20 text-green-400 border-green-500/30',
    angry: 'bg-red-500/20 text-red-400 border-red-500/30',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    scheming: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    excited: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    sad: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    anxious: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    bored: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  }
  return map[mood] ?? map.neutral ?? ''
}

function relationshipColor(status: string): string {
  const map: Record<string, string> = {
    love: 'text-pink-400',
    hate: 'text-red-400',
    neutral: 'text-gray-400',
    rivalry: 'text-orange-400',
    friendship: 'text-green-400',
    distrust: 'text-yellow-400',
  }
  return map[status] ?? 'text-gray-400'
}

const activeAgentName = computed(() => {
  if (currentAgentIndex.value >= 0 && currentAgentIndex.value < agents.value.length) {
    return agents.value[currentAgentIndex.value]?.name ?? ''
  }
  return ''
})
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] max-w-full mx-auto">
    <!-- Main Chat Area -->
    <div class="flex flex-col flex-1 min-w-0">
      <!-- Top Bar -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <h1 class="text-lg font-bold text-gray-900 dark:text-white">Agent Chat</h1>
          <!-- Agent Avatars -->
          <div class="flex -space-x-2">
            <img
              v-for="agent in agents"
              :key="agent.id"
              :src="agent.avatarUrl"
              :alt="agent.name"
              :title="`${agent.name} (${agent.mood})`"
              class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-600"
              :class="{ 'ring-2 ring-primary animate-pulse': cycleRunning && agents[currentAgentIndex]?.id === agent.id }"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Init Model Button -->
          <button
            v-if="!modelReady"
            id="init-model-btn"
            @click="initModel"
            :disabled="modelLoading"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm"
            :class="modelLoading
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-wait'
              : 'bg-gradient-to-r from-primary to-cyan-500 text-white hover:shadow-lg hover:from-primary-hover hover:to-cyan-600'"
          >
            <span v-if="modelLoading" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Loading {{ modelProgress }}%
            </span>
            <span v-else>Initialize Model</span>
          </button>

          <!-- ACT Button -->
          <button
            v-if="modelReady"
            id="act-btn"
            @click="handleAct"
            :disabled="cycleRunning || messages.length === 0"
            class="px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-md"
            :class="cycleRunning
              ? 'bg-amber-500/50 text-amber-200 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed'"
          >
            <span v-if="cycleRunning" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ activeAgentName }} thinking...
            </span>
            <span v-else>Act</span>
          </button>

          <!-- Toggle Debug -->
          <button
            @click="showDebug = !showDebug"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            :title="showDebug ? 'Hide Debug Panel' : 'Show Debug Panel'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Chat Messages Area -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto space-y-3 p-4">
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <svg class="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="text-lg font-medium">Start a conversation</p>
          <p class="text-sm mt-1">Type a message below and press Act to watch the bots respond</p>
        </div>

        <template v-for="msg in messages" :key="msg.id">
          <div :class="{ 'flex justify-end': msg.sender === 'user' }">
            <div
              class="flex items-start gap-2.5 max-w-[75%] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700/50 transition-all"
              :class="msg.sender === 'user'
                ? 'bg-primary/10 dark:bg-primary/20 ml-auto'
                : 'bg-white dark:bg-gray-800'"
            >
              <img
                v-if="msg.sender !== 'user'"
                :src="agents.find((a: any) => a.id === msg.sender)?.avatarUrl ?? '/svg/profile.svg'"
                :alt="msg.senderName"
                class="w-8 h-8 rounded-full flex-shrink-0 bg-gray-100 dark:bg-gray-600"
              />
              <div class="flex flex-col gap-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ msg.senderName }}</span>
                  <span class="text-xs text-gray-400">{{ formatTime(msg.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">{{ msg.text }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- Typing indicator -->
        <div v-if="cycleRunning" class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 animate-pulse">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
          <span>{{ activeAgentName }} is typing...</span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <form @submit.prevent="handleSend" class="flex items-center gap-2">
          <input
            id="chat-input"
            v-model="newMessage"
            type="text"
            placeholder="Write a message..."
            class="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            :disabled="!modelReady"
          />
          <button
            id="send-btn"
            type="submit"
            class="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!newMessage.trim() || !modelReady"
          >
            <svg class="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Debug Sidebar -->
    <transition name="slide">
      <aside
        v-if="showDebug"
        class="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-y-auto flex-shrink-0"
      >
        <div class="p-4 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent Debug</h2>
            <button
              id="create-bot-btn"
              @click="showCreateForm = !showCreateForm"
              class="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all"
              :class="showCreateForm
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'"
            >
              <svg class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-45': showCreateForm }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              {{ showCreateForm ? 'Cancel' : 'Add Bot' }}
            </button>
          </div>

          <!-- Bot Creation Form -->
          <transition name="expand">
            <div v-if="showCreateForm" class="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 space-y-3">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Create New Bot</h3>

              <!-- Avatar Preview + Seed -->
              <div class="flex items-center gap-3">
                <img
                  :src="avatarPreviewUrl"
                  alt="Avatar preview"
                  class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                />
                <div class="flex-1 space-y-1">
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">Avatar Seed</label>
                  <div class="flex gap-1">
                    <input
                      id="bot-avatar-seed"
                      v-model="newBotAvatarSeed"
                      type="text"
                      placeholder="e.g. CoolBot"
                      class="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary/50"
                    />
                    <button
                      type="button"
                      @click="randomizeSeed"
                      class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      title="Randomize"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Name -->
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label>
                <input
                  id="bot-name"
                  v-model="newBotName"
                  type="text"
                  placeholder="e.g. Pixel"
                  class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <!-- System Prompt -->
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">System Prompt *</label>
                <textarea
                  id="bot-prompt"
                  v-model="newBotPrompt"
                  rows="3"
                  placeholder="Describe personality, tone, quirks..."
                  class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary/50 resize-none"
                ></textarea>
              </div>

              <!-- Color -->
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Color</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="color in colorOptions"
                    :key="color.value"
                    type="button"
                    @click="newBotColor = color.value"
                    class="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                    :class="newBotColor === color.value ? 'border-white dark:border-white ring-2 ring-primary scale-110' : 'border-transparent'"
                    :style="{ backgroundColor: color.preview }"
                    :title="color.label"
                  />
                </div>
              </div>

              <!-- Submit -->
              <button
                id="confirm-create-bot"
                @click="handleCreateBot"
                :disabled="!newBotName.trim() || !newBotPrompt.trim()"
                class="w-full py-2 text-sm font-bold rounded-lg transition-all shadow-sm bg-gradient-to-r from-primary to-cyan-500 text-white hover:shadow-md hover:from-primary-hover hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Bot
              </button>
            </div>
          </transition>

          <!-- Model Status -->
          <div class="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 rounded-full" :class="modelReady ? 'bg-green-500' : modelLoading ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'"></div>
              <span class="text-xs font-medium text-gray-600 dark:text-gray-300">
                {{ modelReady ? 'Model Ready' : modelLoading ? `Loading ${modelProgress}%` : 'Model Not Loaded' }}
              </span>
            </div>
            <div v-if="modelLoading" class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
              <div class="bg-primary h-1.5 rounded-full transition-all duration-300" :style="{ width: modelProgress + '%' }"></div>
            </div>
          </div>

          <!-- Agent Cards -->
          <div v-for="agent in agents" :key="agent.id"
            class="p-3 rounded-lg border shadow-sm transition-all"
            :class="cycleRunning && agents[currentAgentIndex]?.id === agent.id
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 ring-1 ring-amber-400/30'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'"
          >
            <div class="flex items-center gap-2 mb-2">
              <img :src="agent.avatarUrl" :alt="agent.name" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ agent.name }}</div>
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border"
                  :class="moodColor(agent.mood)"
                >
                  {{ agent.mood }}
                </span>
              </div>
              <!-- Delete button for custom agents -->
              <button
                v-if="isCustomAgent(agent.id)"
                @click="removeCustomAgent(agent.id)"
                class="p-1 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/10 flex-shrink-0"
                title="Remove bot"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

            <!-- Last Reflection -->
            <div v-if="agent.lastReflection" class="mt-2 p-2 rounded bg-gray-100 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300 italic">
              "{{ agent.lastReflection }}"
            </div>

            <!-- Relationships -->
            <div class="mt-2 space-y-1">
              <div
                v-for="rel in agent.relationships"
                :key="rel.targetId"
                class="flex items-center justify-between text-xs"
              >
                <span class="text-gray-500 dark:text-gray-400">{{ rel.targetName }}</span>
                <span class="font-semibold" :class="relationshipColor(rel.status)">{{ rel.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </transition>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 600px;
}
</style>
