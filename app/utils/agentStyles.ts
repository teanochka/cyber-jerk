// Shared style/color utilities for agent-related UI.

export const COLOR_OPTIONS = [
    { value: 'bg-pink-500', label: 'Pink', preview: '#ec4899' },
    { value: 'bg-rose-500', label: 'Rose', preview: '#f43f5e' },
    { value: 'bg-red-500', label: 'Red', preview: '#ef4444' },
    { value: 'bg-orange-500', label: 'Orange', preview: '#f97316' },
    { value: 'bg-amber-500', label: 'Amber', preview: '#f59e0b' },
    { value: 'bg-yellow-500', label: 'Yellow', preview: '#eab308' },
    { value: 'bg-lime-500', label: 'Lime', preview: '#84cc16' },
    { value: 'bg-green-500', label: 'Green', preview: '#22c55e' },
    { value: 'bg-emerald-500', label: 'Emerald', preview: '#10b981' },
    { value: 'bg-teal-500', label: 'Teal', preview: '#14b8a6' },
    { value: 'bg-cyan-500', label: 'Cyan', preview: '#06b6d4' },
    { value: 'bg-sky-500', label: 'Sky', preview: '#0ea5e9' },
    { value: 'bg-blue-500', label: 'Blue', preview: '#3b82f6' },
    { value: 'bg-indigo-500', label: 'Indigo', preview: '#6366f1' },
    { value: 'bg-violet-500', label: 'Violet', preview: '#8b5cf6' },
    { value: 'bg-purple-500', label: 'Purple', preview: '#a855f7' },
    { value: 'bg-fuchsia-500', label: 'Fuchsia', preview: '#d946ef' },
] as const

export function avatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
}

export function moodColor(mood: string): string {
    const map: Record<string, string> = {
        happy: 'bg-green-500/20 text-green-400 border-green-500/30',
        angry: 'bg-red-500/20 text-red-400 border-red-500/30',
        neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        scheming: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        excited: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        sad: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        anxious: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        bored: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    }
    return map[mood] ?? map.neutral ?? ''
}

export function relationshipColor(status: string): string {
    const map: Record<string, string> = {
        love: 'text-pink-400',
        hate: 'text-red-400',
        neutral: 'text-gray-400',
        rivalry: 'text-orange-400',
        friendship: 'text-green-400',
        distrust: 'text-yellow-400',
    }
    return map[status] ?? 'text-gray-400'
}

export function formatTime(ts: number): string {
    const d = new Date(ts)
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}
