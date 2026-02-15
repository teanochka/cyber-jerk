import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from '../db/schema'

export { schema }

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDrizzle() {
    if (!_db) {
        _db = drizzle(process.env.DATABASE_URL!, { schema, mode: 'default' })
    }
    return _db
}
