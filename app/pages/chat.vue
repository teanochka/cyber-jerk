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
  createCustomAgent,
  removeCustomAgent,
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

const activeAgentName = computed(() => {
  if (currentAgentIndex.value >= 0 && currentAgentIndex.value < agents.value.length) {
    return agents.value[currentAgentIndex.value]?.name ?? ''
  }
  return ''
})

function getAvatarUrl(senderId: string): string {
  return agents.value.find((a) => a.id === senderId)?.avatarUrl ?? '/svg/profile.svg'
}
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
            <NuxtLink
              v-for="agent in agents"
              :key="agent.id"
              :to="`/agent/${agent.id}`"
              :title="`${agent.name} (${agent.mood})`"
              class="block hover:z-10 transition-transform hover:scale-110"
            >
              <img
                :src="agent.avatarUrl"
                :alt="agent.name"
                class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-600"
                :class="{ 'ring-2 ring-primary animate-pulse': cycleRunning && agents[currentAgentIndex]?.id === agent.id }"
              />
            </NuxtLink>
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

        <ChatBubble
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          :avatar-url="getAvatarUrl(msg.sender)"
        />

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
      <AgentDebugPanel
        v-if="showDebug"
        :agents="agents"
        :model-ready="modelReady"
        :model-loading="modelLoading"
        :model-progress="modelProgress"
        :cycle-running="cycleRunning"
        :current-agent-index="currentAgentIndex"
        @create-bot="createCustomAgent"
        @remove-bot="removeCustomAgent"
      />
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
