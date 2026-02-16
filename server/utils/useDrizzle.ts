import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import * as tables from '../db/schema'

let _db: ReturnType<typeof drizzle<typeof tables>> | null = null
let _sqlite: Database.Database | null = null

export function useDrizzle() {
    if (!_db) {
        // Remove quotes and file: prefix if present, handle both formats
        let dbPath = process.env.DATABASE_URL || './data/sqlite.db'
        dbPath = dbPath.replace(/^["']|["']$/g, '').replace(/^file:/, '')
        
        // Ensure directory exists
        try {
            mkdirSync(dirname(dbPath), { recursive: true })
        } catch (err) {
            // Directory might already exist, ignore
        }
        
        _sqlite = new Database(dbPath)
        _db = drizzle(_sqlite, { schema: tables })
    }
    return _db
}

export { tables }
