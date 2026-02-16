import { getConversationById, getConversationMessages } from '../../utils/chat'

export default eventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const conversationId = parseInt(getRouterParam(event, 'conversationId') || '0')
  
  if (!conversationId || isNaN(conversationId)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid conversationId'
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

  // Get all messages
  const messages = await getConversationMessages(conversationId)

  return {
    conversation: {
      id: conversation.id,
      userId: conversation.userId,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    },
    messages: messages.map(msg => ({
      id: msg.id,
      sender: msg.sender,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
      createdAt: msg.createdAt
    }))
  }
})
