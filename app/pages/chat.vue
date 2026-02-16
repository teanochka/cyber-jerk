<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Чат между AI-агентами
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Наблюдайте за диалогом между двумя искусственными интеллектами
        </p>
      </div>

      <!-- Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Начальное сообщение (опционально)
            </label>
            <input
              v-model="initialMessage"
              type="text"
              placeholder="Введите тему для обсуждения..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              :disabled="isLoading"
            />
          </div>
          <div class="flex items-end gap-2">
            <button
              @click="handleStart"
              :disabled="isLoading || !!conversationId"
              class="px-6 py-2 bg-gradient-to-r from-primary to-cyan-500 text-white rounded-lg hover:shadow-lg hover:from-primary-hover hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ conversationId ? 'Новый диалог' : 'Начать диалог' }}
            </button>
            <button
              v-if="conversationId && canContinue"
              @click="handleContinue"
              :disabled="isLoading"
              class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
      >
        <p class="text-red-800 dark:text-red-200">{{ error }}</p>
      </div>

      <!-- Loading Indicator -->
      <div
        v-if="isLoading"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 text-center"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Агенты общаются...</p>
      </div>

      <!-- Messages -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div v-if="messages.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Начните новый диалог, чтобы увидеть общение между агентами</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(message, index) in messages"
            :key="message.id || index"
            class="flex flex-col"
            :class="{
              'items-start': message.sender === 'agentA',
              'items-end': message.sender === 'agentB',
              'items-center': message.sender === 'user'
            }"
          >
            <div
              class="max-w-[80%] rounded-lg px-4 py-3"
              :class="{
                'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100': message.sender === 'agentA',
                'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100': message.sender === 'agentB',
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200': message.sender === 'user'
              }"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-semibold">
                  {{ getSenderLabel(message.sender) }}
                </span>
                <span
                  v-if="message.createdAt"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ formatDate(message.createdAt) }}
                </span>
              </div>
              <p class="whitespace-pre-wrap">{{ message.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Conversation Info -->
      <div v-if="conversationId" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        ID диалога: {{ conversationId }}
        <span v-if="agentMessageCount > 0"> · Сообщений по теме: {{ agentMessageCount }} из {{ MAX_AGENT_MESSAGES }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  conversationId,
  messages,
  isLoading,
  error,
  startConversation,
  continueConversation,
  clearConversation
} = useChatAgents()

const initialMessage = ref('')

/** Лимит сообщений агентов на одну тему (совпадает с сервером) */
const MAX_AGENT_MESSAGES = 4
const agentMessageCount = computed(() =>
  messages.value.filter(m => m.sender === 'agentA' || m.sender === 'agentB').length
)
const canContinue = computed(() => agentMessageCount.value < MAX_AGENT_MESSAGES)

const getSenderLabel = (sender: string) => {
  switch (sender) {
    case 'agentA':
      return '🤖 Agent A (Технический эксперт)'
    case 'agentB':
      return '💡 Agent B (Креативный стратег)'
    case 'user':
      return '👤 Пользователь'
    default:
      return sender
  }
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const handleStart = async () => {
  if (conversationId.value) {
    clearConversation()
    initialMessage.value = ''
    return
  }

  try {
    await startConversation({
      initialMessage: initialMessage.value || undefined,
      steps: 2
    })
    initialMessage.value = ''
  } catch (err) {
    console.error('Failed to start conversation:', err)
  }
}

const handleContinue = async () => {
  try {
    const steps = Math.min(2, MAX_AGENT_MESSAGES - agentMessageCount.value)
    await continueConversation(steps)
  } catch (err) {
    console.error('Failed to continue conversation:', err)
  }
}
</script>
<script setup lang="ts">
import { ref } from 'vue'

const messages = ref([
  {
    id: 1,
    message: "Hey there! How's it going?",
    userName: "Bonnie Green",
    time: "11:46",
    backgroundColor: "bg-cyan-500"
  },
  {
    id: 2,
    message: "I'm doing great, thanks for asking! Just working on this new chat app.",
    userName: "You",
    time: "11:47", 
    backgroundColor: "bg-primary/10" // Differentiate own messages
  },
  {
    id: 3,
    message: "That sounds awesome! What tech stack are you using?",
    userName: "Bonnie Green",
    time: "11:48",
    backgroundColor: "bg-cyan-500"
  }
])

const newMessage = ref('')

const sendMessage = () => {
    if (!newMessage.value.trim()) return

    const now = new Date()
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')

    messages.value.push({
        id: Date.now(),
        message: newMessage.value,
        userName: "You",
        time: timeString,
        backgroundColor: "bg-primary/10"
    })
    newMessage.value = ''
}
</script>

<template>
    <div class="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto p-4">
        <!-- Chat Messages Area -->
        <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            <template v-for="msg in messages" :key="msg.id">
                <div :class="{'flex justify-end': msg.userName === 'You'}">
                    <ChatBubble 
                        :message="msg.message" 
                        :user-name="msg.userName" 
                        :time="msg.time" 
                        :background-color="msg.backgroundColor"
                    />
                </div>
            </template>
        </div>

        <!-- Input Area -->
        <div class="mt-auto">
            <form @submit.prevent="sendMessage" class="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <button type="button" class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                    </svg>
                </button>
                <input 
                    v-model="newMessage" 
                    type="text" 
                    placeholder="Write a message..." 
                    class="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500"
                >
                <div class="flex items-center gap-1">
                     <button type="button" class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                    <button type="submit" class="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newMessage.trim()">
                        <svg class="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
