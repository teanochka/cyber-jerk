import { mysqlTable, int, varchar, timestamp, text, bigint } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const users = mysqlTable('users', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const chatMessages = mysqlTable('chat_messages', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').notNull(),
    sender: varchar('sender', { length: 100 }).notNull(),
    senderName: varchar('sender_name', { length: 255 }).notNull(),
    text: text('text').notNull(),
    color: varchar('color', { length: 100 }).notNull(),
    timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
})

export const agentStates = mysqlTable('agent_states', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').notNull(),
    agentId: varchar('agent_id', { length: 100 }).notNull(),
    mood: varchar('mood', { length: 50 }).notNull().default('neutral'),
    lastReflection: text('last_reflection').notNull(),
    relationships: text('relationships').notNull(),
})
