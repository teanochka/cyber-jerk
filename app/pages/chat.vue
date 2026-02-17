<script setup lang="ts">
definePageMeta({
  layout: false,
})
import { ref, nextTick, watch, computed } from 'vue'
import { useChatAgents } from '~/composables/useChatAgents'

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
} = useChatAgents()

const newMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const showDebug = ref(true)

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
                :src="agents.find(a => a.id === msg.sender)?.avatarUrl ?? '/svg/profile.svg'"
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
          <h2 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent Debug</h2>

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
              <div>
                <div class="text-sm font-bold text-gray-900 dark:text-white">{{ agent.name }}</div>
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border"
                  :class="moodColor(agent.mood)"
                >
                  {{ agent.mood }}
                </span>
              </div>
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
</style>
