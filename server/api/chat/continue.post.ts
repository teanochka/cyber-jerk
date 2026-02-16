import { getConversationById, createMessage, getConversationMessages, MAX_AGENT_MESSAGES_PER_TOPIC, MAX_STEPS_ON_CONTINUE } from '../../utils/chat'
import { sendToGemini } from '../../utils/geminiClient'
import { getAgentSystemPrompt } from '../../utils/agents'

export default eventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const conversationId = body.conversationId
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      message: 'conversationId is required'
    })
  }

  // Get user ID from session
  const { findUserByEmail } = await import('../../utils/users')
  const user = await findUserByEmail(session.user.email)
  
  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  // Get conversation and verify ownership
  const conversation = await getConversationById(conversationId, user.id)
  
  if (!conversation) {
    throw createError({
      statusCode: 404,
      message: 'Conversation not found'
    })
  }

  // Get existing messages
  const existingMessages = await getConversationMessages(conversationId)
  const agentMessageCount = existingMessages.filter(m => m.sender === 'agentA' || m.sender === 'agentB').length
  if (agentMessageCount >= MAX_AGENT_MESSAGES_PER_TOPIC) {
    throw createError({
      statusCode: 400,
      message: `Достигнут лимит сообщений по теме (${MAX_AGENT_MESSAGES_PER_TOPIC}). Начните новый диалог.`
    })
  }
  const steps = Math.min(
    Math.max(1, parseInt(body.steps, 10) || 2),
    MAX_STEPS_ON_CONTINUE,
    MAX_AGENT_MESSAGES_PER_TOPIC - agentMessageCount
  )

  // Determine which agent should speak next
  // If no messages, start with agentA
  // Otherwise, alternate based on last message
  let currentAgent: 'agentA' | 'agentB' = 'agentA'
  if (existingMessages.length > 0) {
    const lastMessage = existingMessages[existingMessages.length - 1]
    if (lastMessage.sender === 'agentA') {
      currentAgent = 'agentB'
    } else if (lastMessage.sender === 'agentB') {
      currentAgent = 'agentA'
    }
  }

  // Build conversation history for Gemini
  const conversationHistory = existingMessages
    .filter(msg => msg.sender !== 'user')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user' as 'user' | 'model',
      parts: msg.content
    }))

  const newMessages: Array<{ sender: 'agentA' | 'agentB', content: string }> = []

  for (let i = 0; i < steps; i++) {
    const agentPrompt = getAgentSystemPrompt(currentAgent)
    const otherAgent = currentAgent === 'agentA' ? 'agentB' : 'agentA'
    
    // Build context message
    const contextMessage = conversationHistory.length === 0
      ? `You are ${currentAgent === 'agentA' ? 'Agent A' : 'Agent B'}. Start a conversation with ${otherAgent === 'agentA' ? 'Agent A' : 'Agent B'}.`
      : `Continue the conversation as ${currentAgent === 'agentA' ? 'Agent A' : 'Agent B'}. Respond naturally to the conversation.`

    try {
      const response = await sendToGemini(
        [
          ...conversationHistory,
          { role: 'user', parts: contextMessage }
        ],
        agentPrompt
      )

      const messageContent = response.text
      newMessages.push({
        sender: currentAgent,
        content: messageContent
      })

      // Save message to database
      await createMessage({
        conversationId: conversation.id,
        sender: currentAgent,
        role: 'assistant',
        content: messageContent,
        metadata: {
          model: response.metadata?.model,
          finishReason: response.metadata?.finishReason,
          usage: response.metadata?.usage
        }
      })

      // Update conversation history
      conversationHistory.push(
        { role: 'user', parts: contextMessage },
        { role: 'model', parts: messageContent }
      )

      // Switch to the other agent
      currentAgent = currentAgent === 'agentA' ? 'agentB' : 'agentA'
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        message: `Error generating response from ${currentAgent}: ${error.message}`
      })
    }
  }

  // Get all messages from the conversation
  const allMessages = await getConversationMessages(conversationId)

  return {
    conversationId: conversation.id,
    newMessages: newMessages.map((msg, idx) => ({
      sender: msg.sender,
      content: msg.content
    })),
    messages: allMessages.map(msg => ({
      id: msg.id,
      sender: msg.sender,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
      createdAt: msg.createdAt
    }))
  }
})
