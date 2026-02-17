import { eq } from 'drizzle-orm'
import { useDrizzle, tables } from '../../utils/useDrizzle'

export default eventHandler(async (event) => {
    const session = await getUserSession(event)
    const userId = (session.user as any)?.id
    if (!userId) {
        throw createError({ statusCode: 401, message: 'Not authenticated' })
    }

    const body = await readBody(event)
    const { messages, agentStates, customAgents } = body

    const db = useDrizzle()

    // Delete old messages for this user and insert new ones.
    await db.delete(tables.chatMessages).where(eq(tables.chatMessages.userId, userId))

    if (messages && messages.length > 0) {
        await db.insert(tables.chatMessages).values(
            messages.map((m: any) => ({
                userId,
                sender: m.sender,
                senderName: m.senderName,
                text: m.text,
                color: m.color,
                timestamp: m.timestamp,
            })),
        )
    }

    // Delete old agent states for this user and insert new ones.
    await db.delete(tables.agentStates).where(eq(tables.agentStates.userId, userId))

    if (agentStates && agentStates.length > 0) {
        await db.insert(tables.agentStates).values(
            agentStates.map((s: any) => ({
                userId,
                agentId: s.agentId,
                mood: s.mood,
                lastReflection: s.lastReflection,
                relationships: JSON.stringify(s.relationships),
            })),
        )
    }

    // Sync custom agent configs: delete all, then re-insert current list.
    await db.delete(tables.customAgents).where(eq(tables.customAgents.userId, userId))

    if (customAgents && customAgents.length > 0) {
        await db.insert(tables.customAgents).values(
            customAgents.map((c: any) => ({
                userId,
                agentId: c.id,
                name: c.name,
                color: c.color,
                avatarSeed: c.avatarSeed,
                systemPrompt: c.systemPrompt,
            })),
        )
    }

    return { ok: true }
})
