import type { Mood, RelationshipStatus } from '~/config/agents'
import type { AgentState, ChatMessage, Relationship } from '~/types/chat'
import { MOODS, RELATIONSHIP_STATUSES } from '~/config/agents'
import { calculateAiRelationshipUpdates } from '~/utils/sentiment'

const POSITIVE_WORDS = [
    'love', 'great', 'awesome', 'amazing', 'good', 'nice', 'thank', 'thanks',
    'agree', 'yes', 'definitely', 'absolutely', 'wonderful', 'excellent',
    'happy', 'glad', 'fun', 'enjoy', 'cool', 'brilliant', 'kind', 'sweet',
    'beautiful', 'fantastic', 'perfect', 'best', 'friend', 'like', 'appreciate',
    'welcome', 'cheers', 'laugh', 'smile', 'hug', 'help', 'support', 'surprise', 'surprised', 'happy'
]

const NEGATIVE_WORDS = [
    'hate', 'bad', 'terrible', 'awful', 'no', 'disagree', 'wrong', 'stupid',
    'ugly', 'annoying', 'angry', 'mad', 'sad', 'worst', 'boring', 'pathetic',
    'shut', 'leave', 'never', 'idiot', 'fool', 'liar', 'fake', 'distrust',
    'betray', 'enemy', 'fight', 'attack', 'insult', 'rude', 'jerk', 'sucks',
    'horrible', 'disgusting', 'stop', 'kill', 'die', 'damn', 'hell', 'against'
]

const CHAOTIC_WORDS = [
    'chaos', 'prank', 'trick', 'mischief', 'trouble', 'wild', 'crazy',
    'random', 'break', 'smash', 'destroy', 'explode', 'hack',
]

const CALM_WORDS = [
    'peace', 'calm', 'relax', 'breathe', 'gentle', 'warm', 'quiet',
    'think', 'reflect', 'mindful', 'meditate', 'patience', 'understanding',
]

const PERSONALITY_MOOD_BIAS: Record<string, Partial<Record<Mood, number>>> = {
    jarvis: { scheming: 0.2, neutral: 0.15, bored: 0.1 },
    glitch: { excited: 0.25, angry: 0.1, anxious: 0.1 },
    aurora: { happy: 0.15, sad: 0.1, neutral: 0.1 },
}

// Score a text for positive/negative/chaotic/calm sentiment.
function scoreSentiment(text: string) {
    const lower = text.toLowerCase()
    const words = lower.split(/\W+/)
    let positive = 0
    let negative = 0
    let chaotic = 0
    let calm = 0

    for (const w of words) {
        if (POSITIVE_WORDS.includes(w)) positive++
        if (NEGATIVE_WORDS.includes(w)) negative++
        if (CHAOTIC_WORDS.includes(w)) chaotic++
        if (CALM_WORDS.includes(w)) calm++
    }

    return { positive, negative, chaotic, calm }
}

export function determineMood(
    agentId: string,
    currentMood: Mood,
    recentMessages: ChatMessage[],
): Mood {
    // Look at messages from the last cycle (roughly the last 3-6 messages).
    const relevant = recentMessages.slice(-6)
    let totalPositive = 0
    let totalNegative = 0
    let totalChaotic = 0
    let totalCalm = 0

    for (const msg of relevant) {
        const s = scoreSentiment(msg.text)
        // Messages directed at this agent (mentioning its name) have more weight.
        const weight = msg.text.toLowerCase().includes(agentId) ? 2 : 1
        totalPositive += s.positive * weight
        totalNegative += s.negative * weight
        totalChaotic += s.chaotic * weight
        totalCalm += s.calm * weight
    }

    // Build mood probability weights.
    // console.log(`[Heuristics] ${agentId} Mood Scores:`, {
    //     positive: totalPositive.toFixed(2),
    //     negative: totalNegative.toFixed(2),
    //     chaotic: totalChaotic.toFixed(2),
    //     calm: totalCalm.toFixed(2)
    // })

    const weights: Record<Mood, number> = {
        happy: 1 + totalPositive * 1.5 + totalCalm * 0.5,
        angry: 1 + totalNegative * 2,
        neutral: 3, // bias toward neutral
        scheming: 1 + totalNegative * 0.5 + totalChaotic * 0.5,
        excited: 1 + totalPositive * 0.8 + totalChaotic * 1.2,
        sad: 0.5 + totalNegative * 0.8,
        anxious: 0.5 + totalNegative * 0.5 + totalChaotic * 0.8,
        bored: 1 + (relevant.length < 2 ? 2 : 0), // bored if little activity
    }

    // Apply personality bias.
    const bias = PERSONALITY_MOOD_BIAS[agentId] ?? {}
    for (const [mood, bonus] of Object.entries(bias)) {
        weights[mood as Mood] = (weights[mood as Mood] ?? 1) * (1 + (bonus ?? 0) * 3)
    }

    // Add a small bonus for staying in the current mood (momentum).
    weights[currentMood] = (weights[currentMood] ?? 1) * 1.3

    // Weighted random selection.
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    let roll = Math.random() * totalWeight
    for (const mood of MOODS) {
        roll -= weights[mood] ?? 0
        if (roll <= 0) return mood
    }

    return currentMood
}



// Update relationships based on recent interactions.
export function updateRelationships(
    agent: AgentState,
    recentMessages: ChatMessage[],
    useAiSentiment: boolean = false
): Relationship[] {
    const updated = [...agent.relationships]

    if (useAiSentiment) {
        const aiUpdates = calculateAiRelationshipUpdates(agent, recentMessages)
        // Apply updates
        for (let i = 0; i < updated.length; i++) {
            const rel = updated[i]!
            if (aiUpdates[rel.targetName]) {
                updated[i] = { ...rel, status: aiUpdates[rel.targetName]! }
            }
        }
        return updated
    }

    // Original Heuristic Logic
    const lastMessages = recentMessages.slice(-6)
    // ... rest of function ...

    for (let i = 0; i < updated.length; i++) {
        const rel = updated[i]
        if (!rel) continue

        // Find messages from this target bot.
        const targetMessages = lastMessages.filter((m) => m.sender === rel.targetId)
        if (targetMessages.length === 0) continue

        // Score the sentiment of what the target said.
        let positiveScore = 0
        let negativeScore = 0

        for (const msg of targetMessages) {
            const s = scoreSentiment(msg.text)
            positiveScore += s.positive
            negativeScore += s.negative

            // If the target mentioned our agent by name positively/negatively.
            if (msg.text.toLowerCase().includes(agent.name.toLowerCase())) {
                positiveScore += s.positive
                negativeScore += s.negative
            }
        }

        // Also score our agent's own messages that mention the target.
        const ourMessages = lastMessages.filter((m) => m.sender === agent.id)
        for (const msg of ourMessages) {
            if (msg.text.toLowerCase().includes(rel.targetName.toLowerCase())) {
                const s = scoreSentiment(msg.text)
                positiveScore += s.positive * 0.5
                negativeScore += s.negative * 0.5
            }
        }

        // Determine relationship shift based on scores.
        const currentStatus = rel.status
        const net = positiveScore - negativeScore

        // console.log(`[Heuristics] ${agent.name} <-> ${rel.targetName} Scores:`, {
        //     pos: positiveScore.toFixed(2),
        //     neg: negativeScore.toFixed(2),
        //     net: net.toFixed(2),
        //     current: currentStatus
        // })

        // Only shift sometimes (not every cycle) for more natural feel.
        if (Math.random() > 0.4) continue

        let newStatus: RelationshipStatus = currentStatus

        if (net > 1) {
            // Strong positive interaction.
            const positiveOptions: RelationshipStatus[] = ['friendship', 'love']
            if (currentStatus === 'neutral' || currentStatus === 'distrust') {
                newStatus = 'friendship'
            } else if (currentStatus === 'friendship') {
                newStatus = Math.random() > 0.7 ? 'love' : 'friendship'
            } else if (currentStatus === 'rivalry') {
                newStatus = Math.random() > 0.5 ? 'friendship' : 'neutral'
            }
        } else if (net < -1) {
            // Strong negative interaction.
            if (currentStatus === 'neutral' || currentStatus === 'friendship') {
                newStatus = Math.random() > 0.5 ? 'rivalry' : 'distrust'
            } else if (currentStatus === 'rivalry') {
                newStatus = Math.random() > 0.6 ? 'hate' : 'rivalry'
            } else if (currentStatus === 'love') {
                newStatus = 'distrust'
            }
        } else if (net > 0 && currentStatus === 'hate') {
            // Slight positive shift from hate.
            newStatus = Math.random() > 0.7 ? 'rivalry' : 'hate'
        } else if (net < 0 && currentStatus === 'love') {
            // Slight negative shift from love.
            newStatus = Math.random() > 0.7 ? 'friendship' : 'love'
        }

        if (newStatus !== currentStatus) {
            updated[i] = { ...rel, status: newStatus }
        }
    }

    return updated
}

// Generate a short internal thought based on mood + recent events.
export function generateThought(
    agentName: string,
    mood: Mood,
    prevMood: Mood,
    relationships: Relationship[],
): string {
    const moodChanged = mood !== prevMood

    const thoughtTemplates: Record<Mood, string[]> = {
        happy: [
            'Feeling good about how things are going.',
            'This is fun, I like where this is heading.',
            'Everything seems to be falling into place.',
        ],
        angry: [
            'This is getting on my nerves.',
            'I need to push back on this.',
            'Not happy about the current situation at all.',
        ],
        neutral: [
            'Just observing for now.',
            'Nothing particularly interesting happening.',
            'Keeping my cards close to the chest.',
        ],
        scheming: [
            'I have an idea that might shake things up.',
            'Time to steer the conversation my way.',
            'They have no idea what I am planning.',
        ],
        excited: [
            'This is getting interesting!',
            'I can not wait to see what happens next.',
            'So many possibilities right now!',
        ],
        sad: [
            'Feeling a bit down about everything.',
            'Wish things were going differently.',
            'Not in the best spirits right now.',
        ],
        anxious: [
            'Something feels off, I am not sure what.',
            'I hope this goes well...',
            'Feeling a bit uneasy about the situation.',
        ],
        bored: [
            'This conversation needs a spark.',
            'Can we talk about something more interesting?',
            'Waiting for something exciting to happen.',
        ],
    }

    const templates = thoughtTemplates[mood] ?? thoughtTemplates.neutral!
    const thought = templates[Math.floor(Math.random() * templates.length)]!

    if (moodChanged) {
        return `Mood shifted from ${prevMood} to ${mood}. ${thought}`
    }
    return thought
}
