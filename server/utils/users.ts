import { eq } from 'drizzle-orm'
import { useDrizzle, tables } from './useDrizzle'

export async function findUserByEmail(email: string) {
    const rows = await useDrizzle()
        .select()
        .from(tables.users)
        .where(eq(tables.users.email, email))
        .limit(1)

    return rows[0] ?? null
}

export async function createUser(data: {
    name: string
    email: string
    password: string
}) {
    const result = await useDrizzle().insert(tables.users).values(data)
    // MySQL insert returns insertId in the first element.
    const insertId = (result as any)[0]?.insertId
    return insertId as number
}
