import { createConversation, createMessage, getConversationMessages, MAX_STEPS_ON_START } from '../../utils/chat'
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
  const title = body.title
  const initialMessage = body.initialMessage
  const steps = Math.min(Math.max(1, parseInt(body.steps, 10) || 2), MAX_STEPS_ON_START)
  
  // Get user ID from session (assuming we can get it from users table)
  const { findUserByEmail } = await import('../../utils/users')
  const user = await findUserByEmail(session.user.email)
  
  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  // Create new conversation
  const conversation = await createConversation({
    userId: user.id,
    title: title || `Chat started at ${new Date().toLocaleString()}`
  })

  const messages: Array<{ sender: 'agentA' | 'agentB', content: string }> = []

  // If there's an initial message from user, add it
  if (initialMessage) {
    await createMessage({
      conversationId: conversation.id,
      sender: 'user',
      role: 'user',
      content: initialMessage
    })
  }

  // Start the conversation between agents
  let currentAgent: 'agentA' | 'agentB' = 'agentA'
  let conversationHistory: Array<{ role: 'user' | 'model', parts: string }> = []

  // Add initial context if provided
  if (initialMessage) {
    conversationHistory.push({
      role: 'user',
      parts: `User said: "${initialMessage}". Now start a conversation between Agent A and Agent B about this topic.`
    })
  }

  for (let i = 0; i < steps; i++) {
    const agentPrompt = getAgentSystemPrompt(currentAgent)
    const otherAgent = currentAgent === 'agentA' ? 'agentB' : 'agentA'
    
    // Build context for the current agent
    const contextMessage = conversationHistory.length === 0
      ? `You are ${currentAgent === 'agentA' ? 'Agent A' : 'Agent B'}. Start a conversation with ${otherAgent === 'agentA' ? 'Agent A' : 'Agent B'}. ${initialMessage ? `The user mentioned: "${initialMessage}"` : ''}`
      : `Continue the conversation as ${currentAgent === 'agentA' ? 'Agent A' : 'Agent B'}. Respond to the last message from ${otherAgent === 'agentA' ? 'Agent A' : 'Agent B'}.`

    try {
      const response = await sendToGemini(
        [
          ...conversationHistory,
          { role: 'user', parts: contextMessage }
        ],
        agentPrompt
      )

      const messageContent = response.text
      messages.push({
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
  const allMessages = await getConversationMessages(conversation.id)

  return {
    conversationId: conversation.id,
    conversation,
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
