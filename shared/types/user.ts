import { users } from '../../server/db/schema'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
export type UserSession = Omit<User, 'password'>
