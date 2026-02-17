
import { type Mood, type RelationshipStatus, MOODS, RELATIONSHIP_STATUSES } from '~/config/agents'

// Keywords associated with specific moods.
const MOOD_KEYWORDS: Record<Mood, string[]> = {
    happy: ['happy', 'glad', 'great', 'awesome', 'haha', 'lol', 'fun', 'nice', 'splendid', 'cheers'],
    angry: ['angry', 'hate', 'stupid', 'idiot', 'shut up', 'damn', 'hell', 'fury', 'annoying', 'rage'],
    neutral: ['okay', 'fine', 'sure', 'perhaps', 'suppose', 'neutral'],
    scheming: ['plan', 'plot', 'wait', 'secret', 'hidden', 'anticipate', 'prepare', 'soon'],
    excited: ['wow', 'amazing', 'omg', 'yes', 'cool', 'love', 'fantastic', 'cant wait'],
    sad: ['sad', 'sorry', 'hurt', 'sigh', 'unfortunate', 'alas', 'cry', 'grief'],
    anxious: ['worry', 'afraid', 'scared', 'um', 'uh', 'nervous', 'panic', 'stress'],
    bored: ['bored', 'yawn', 'tired', 'whatever', 'dull', 'slow', 'sleep'],
}

// Positive/Negative keywords for relationship scoring.
const POSITIVE_WORDS = ['agree', 'confirms', 'true', 'right', 'correct', 'thanks', 'good', 'great', 'friend', 'cool', 'exactly', 'love', 'smart', 'clever']
const NEGATIVE_WORDS = ['disagree', 'wrong', 'lie', 'liar', 'false', 'bad', 'dumb', 'stupid', 'fake', 'hate', 'enemy', 'rival', 'ugly', 'boring']

// Defined scale for relationship progression.
// Higher index = more positive.
const RELATIONSHIP_SCALE: RelationshipStatus[] = [
    'hate',      // 0
    'distrust',  // 1
    'rivalry',   // 2
    'neutral',   // 3
    'friendship',// 4
    'love'       // 5
]

/**
 * Detects the strongest mood from the text based on keyword counts.
 * Returns null if no strong signal found (keep current mood).
 */
export function detectMood(text: string): Mood | null {
    const lower = text.toLowerCase()
    let bestMood: Mood | null = null
    let maxCount = 0

    for (const mood of MOODS) {
        const keywords = MOOD_KEYWORDS[mood]
        let count = 0
        for (const word of keywords) {
            if (lower.includes(word)) count++
        }
        if (count > maxCount) {
            maxCount = count
            bestMood = mood
        }
    }

    return bestMood
}

/**
 * Analyzes text for mentions of other agents and sentiment.
 * Returns a map of TargetName -> NewStatus if changed.
 */
export function detectRelationshipUpdates(
    text: string,
    currentRelationships: { targetName: string; status: RelationshipStatus }[]
): Record<string, RelationshipStatus> {
    const lower = text.toLowerCase()
    const updates: Record<string, RelationshipStatus> = {}

    for (const rel of currentRelationships) {
        const name = rel.targetName.toLowerCase()
        // Check if this agent is mentioned
        if (lower.includes(name)) {
            // Check sentiment in the message
            let scoreChange = 0
            if (POSITIVE_WORDS.some(w => lower.includes(w))) scoreChange += 1
            if (NEGATIVE_WORDS.some(w => lower.includes(w))) scoreChange -= 1

            if (scoreChange !== 0) {
                const currentIdx = RELATIONSHIP_SCALE.indexOf(rel.status)
                let newIdx = currentIdx + scoreChange

                // Clamp index
                if (newIdx < 0) newIdx = 0
                if (newIdx >= RELATIONSHIP_SCALE.length) newIdx = RELATIONSHIP_SCALE.length - 1

                const newStatus = RELATIONSHIP_SCALE[newIdx]!
                if (newStatus !== rel.status) {
                    updates[rel.targetName] = newStatus
                }
            }
        }
    }

    return updates
}
