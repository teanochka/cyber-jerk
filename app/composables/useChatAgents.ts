export interface ChatMessage {
  id?: number
  sender: 'agentA' | 'agentB' | 'user'
  role: 'system' | 'user' | 'assistant'
  content: string
  metadata?: Record<string, any>
  createdAt?: Date | string
}

export interface Conversation {
  id: number
  userId: number
  title: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface StartChatResponse {
  conversationId: number
  conversation: Conversation
  messages: ChatMessage[]
}

export interface ContinueChatResponse {
  conversationId: number
  newMessages: Array<{ sender: 'agentA' | 'agentB', content: string }>
  messages: ChatMessage[]
}

export const useChatAgents = () => {
  const conversationId = ref<number | null>(null)
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Start a new conversation between two AI agents
   */
  const startConversation = async (options?: {
    title?: string
    initialMessage?: string
    steps?: number
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<StartChatResponse>('/api/chat/start', {
        method: 'POST',
        credentials: 'include',
        body: {
          title: options?.title,
          initialMessage: options?.initialMessage,
          steps: options?.steps || 2
        }
      })

      conversationId.value = response.conversationId
      messages.value = response.messages

      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to start conversation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Continue an existing conversation
   */
  const continueConversation = async (steps: number = 2) => {
    if (!conversationId.value) {
      throw new Error('No active conversation')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ContinueChatResponse>('/api/chat/continue', {
        method: 'POST',
        credentials: 'include',
        body: {
          conversationId: conversationId.value,
          steps
        }
      })

      messages.value = response.messages

      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to continue conversation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load a conversation by ID
   */
  const loadConversation = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{
        conversation: Conversation
        messages: ChatMessage[]
      }>(`/api/chat/${id}`, {
        method: 'GET',
        credentials: 'include'
      })

      conversationId.value = id
      messages.value = response.messages

      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to load conversation'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear current conversation state
   */
  const clearConversation = () => {
    conversationId.value = null
    messages.value = []
    error.value = null
  }

  return {
    conversationId: readonly(conversationId),
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    error: readonly(error),
    startConversation,
    continueConversation,
    loadConversation,
    clearConversation
  }
}
