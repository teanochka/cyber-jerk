import { eq } from 'drizzle-orm'
import { useDrizzle, schema } from './useDrizzle'

export async function findUserByEmail(email: string) {
    const rows = await useDrizzle()
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1)

    return rows[0] ?? null
}

export async function createUser(data: {
    name: string
    email: string
    password: string
}) {
    await useDrizzle().insert(schema.users).values(data)
}
