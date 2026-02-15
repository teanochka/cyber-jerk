import { drizzle } from 'drizzle-orm/mysql2'
import * as tables from '../db/schema'

let _db: ReturnType<typeof drizzle<typeof tables>> | null = null

export function useDrizzle() {
    if (!_db) {
        _db = drizzle(process.env.DATABASE_URL!, { schema: tables, mode: 'default' })
    }
    return _db
}

export { tables }
