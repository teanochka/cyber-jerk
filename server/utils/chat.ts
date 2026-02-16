import { eq, desc, and } from 'drizzle-orm'
import { useDrizzle, tables } from './useDrizzle'

/** Максимум сообщений от агентов на одну тему (лимит запросов к API, ~15/мин) */
export const MAX_AGENT_MESSAGES_PER_TOPIC = 4
/** Максимум шагов за один запрос «Начать диалог» */
export const MAX_STEPS_ON_START = 2
/** Максимум шагов за один запрос «Продолжить» */
export const MAX_STEPS_ON_CONTINUE = 2

export interface ConversationData {
  userId: number
  title?: string
}

export interface MessageData {
  conversationId: number
  sender: 'agentA' | 'agentB' | 'user'
  role: 'system' | 'user' | 'assistant'
  content: string
  metadata?: Record<string, any>
}

/**
 * Create a new conversation
 */
export async function createConversation(data: ConversationData) {
  const db = useDrizzle()
  const result = await db.insert(tables.conversations).values({
    userId: data.userId,
    title: data.title || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning()
  
  return result[0]
}

/**
 * Get conversation by ID
 */
export async function getConversationById(conversationId: number, userId?: number) {
  const db = useDrizzle()
  const conditions = userId
    ? and(eq(tables.conversations.id, conversationId), eq(tables.conversations.userId, userId))
    : eq(tables.conversations.id, conversationId)
  
  const result = await db.select()
    .from(tables.conversations)
    .where(conditions)
    .limit(1)
  
  return result[0] ?? null
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: number) {
  const db = useDrizzle()
  return await db.select()
    .from(tables.conversations)
    .where(eq(tables.conversations.userId, userId))
    .orderBy(desc(tables.conversations.updatedAt))
}

/**
 * Create a message in a conversation
 */
export async function createMessage(data: MessageData) {
  const db = useDrizzle()
  const result = await db.insert(tables.messages).values({
    conversationId: data.conversationId,
    sender: data.sender,
    role: data.role,
    content: data.content,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    createdAt: new Date(),
  }).returning()
  
  // Update conversation updatedAt
  await db.update(tables.conversations)
    .set({ updatedAt: new Date() })
    .where(eq(tables.conversations.id, data.conversationId))
  
  return result[0]
}

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(conversationId: number) {
  const db = useDrizzle()
  return await db.select()
    .from(tables.messages)
    .where(eq(tables.messages.conversationId, conversationId))
    .orderBy(tables.messages.createdAt)
}

/**
 * Get the last N messages from a conversation
 */
export async function getLastMessages(conversationId: number, limit: number = 10) {
  const db = useDrizzle()
  return await db.select()
    .from(tables.messages)
    .where(eq(tables.messages.conversationId, conversationId))
    .orderBy(desc(tables.messages.createdAt))
    .limit(limit)
}
