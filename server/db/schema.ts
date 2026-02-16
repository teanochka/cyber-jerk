import { sqliteTable, integer, text, blob } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const conversations = sqliteTable('conversations', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').references(() => users.id).notNull(),
    title: text('title'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const messages = sqliteTable('messages', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
    sender: text('sender').notNull(), // 'agentA' | 'agentB' | 'user'
    role: text('role').notNull(), // 'system' | 'user' | 'assistant'
    content: text('content').notNull(),
    metadata: text('metadata'), // JSON stored as text in SQLite
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})
