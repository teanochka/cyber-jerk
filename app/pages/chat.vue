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
  isAutoRunning,
  simulationSpeed,
  currentAgentIndex,
  removeCustomAgent,
  sendUserMessage,
  runCycle,
  toggleAutoRun,
  createCustomAgent,
  selectedModel,
  selectedDataType,
  selectedDevice,
  maxTokens,
  availableModels,
  availableDataTypes,
  availableDevices,
  resetModel,
  initModel,
} = useChatAgents()



const newMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const showDebug = ref(true)
const showSettings = ref(false)

function handleSend() {
  if (!newMessage.value.trim()) return
  sendUserMessage(newMessage.value)
  newMessage.value = ''
}

function handleDirectMessage(botName: string) {
  newMessage.value = `@{${botName}} `
  // Focus the input if possible
  document.getElementById('chat-input')?.focus()
}

async function handleAct() {
  await toggleAutoRun()
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
  <div class="flex h-[calc(100vh-20px)] max-w-full mx-auto">
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
            :disabled="messages.length === 0"
            class="px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-md flex items-center gap-2"
            :class="isAutoRunning
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed'"
          >
            <span v-if="cycleRunning" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </span>
            <span>{{ isAutoRunning ? 'Стоп' : 'Старт' }}</span>
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
          <!-- Toggle Settings -->
          <button
            @click="showSettings = !showSettings"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            :title="showSettings ? 'Hide Settings Panel' : 'Show Settings Panel'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>

          </button>
        </div>
      </div>

      <!-- Settings Modal -->
      <div v-if="showSettings" class="w-full flex items-start justify-center p-4">
        <div class="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 class="text-lg font-bold mb-4">
            <span v-if="cycleRunning">Завершите работу ботов, прежде чем менять настройки.</span>
            <span v-else-if="modelLoading">Пожалуйста, дождитесь завершения загрузки модели</span>
            <span v-else>Настройки</span>
          </h2>
          <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">

            <!-- Model Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Модель</label>
              <select 
                v-model="selectedModel" 
                :disabled="cycleRunning || modelLoading"
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>


            <!-- Data Type & Device Row -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Data Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Тип данных</label>
                <select 
                  v-model="selectedDataType"
                  :disabled="cycleRunning || modelLoading"
                  class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option v-for="t in availableDataTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>


              <!-- Device -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Устройство</label>
                <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1" :class="{'opacity-50 cursor-not-allowed': cycleRunning || modelLoading}">
                  <button 
                    v-for="device in availableDevices" 
                    :key="device"
                    @click="!cycleRunning && !modelLoading && (selectedDevice = device)"
                    :disabled="cycleRunning || modelLoading"
                    class="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all disabled:cursor-not-allowed"
                    :class="selectedDevice === device 
                      ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
                  >
                    {{ device }}
                  </button>
                </div>

              </div>
            </div>

            <!-- Max Tokens -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Максимальное количество токенов <span class="text-xs text-gray-400">(до 600)</span>
              </label>
              <div class="flex items-center gap-3">
                <input 
                  type="range" 
                  min="50" 
                  max="600" 
                  step="10"
                  v-model.number="maxTokens" 
                  :disabled="cycleRunning || modelLoading"
                  class="flex-1 h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <input 
                  type="number" 
                  v-model.number="maxTokens"
                  min="1"
                  max="600"
                  :disabled="cycleRunning || modelLoading"
                  class="w-20 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

            </div>

            <!-- Simulation Speed -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Скорость симуляции</label>
              <div class="flex items-center gap-3">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model.number="simulationSpeed" 
                  class="flex-1 h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                />

                <span class="text-gray-400 w-8 text-right text-sm">{{ simulationSpeed }}%</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
               <button
                 v-if="modelReady"
                 @click="() => { resetModel(); initModel(); }"
                 class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
               >
                 Перезагрузить модель
               </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Chat Messages Area -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto space-y-3 p-4">
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <svg class="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="text-lg font-medium">Начать диалог</p>
          <p class="text-sm mt-1">Введите сообщение ниже и нажмите Старт, чтобы посмотреть, как будут отвечать боты</p>
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
          <span>{{ activeAgentName }} пишет...</span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <form @submit.prevent="handleSend" class="flex items-center gap-2">
          <input
            id="chat-input"
            v-model="newMessage"
            type="text"
            placeholder="Напишите сообщение..."
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
        @send-message-to-bot="handleDirectMessage"
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
