import { eq } from 'drizzle-orm'
import { useDrizzle, tables } from '../../utils/useDrizzle'

export default eventHandler(async (event) => {
    const session = await getUserSession(event)
    const userId = (session.user as any)?.id
    if (!userId) {
        throw createError({ statusCode: 401, message: 'Not authenticated' })
    }

    // Load chat messages for this user, ordered by timestamp.
    const msgs = await useDrizzle()
        .select()
        .from(tables.chatMessages)
        .where(eq(tables.chatMessages.userId, userId))
        .orderBy(tables.chatMessages.timestamp)

    // Load agent states for this user.
    const states = await useDrizzle()
        .select()
        .from(tables.agentStates)
        .where(eq(tables.agentStates.userId, userId))

    return {
        messages: msgs.map((m) => ({
            id: m.id,
            sender: m.sender,
            senderName: m.senderName,
            text: m.text,
            timestamp: m.timestamp,
            color: m.color,
        })),
        agentStates: states.map((s) => ({
            agentId: s.agentId,
            mood: s.mood,
            lastReflection: s.lastReflection,
            relationships: JSON.parse(s.relationships),
        })),
    }
})
