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
