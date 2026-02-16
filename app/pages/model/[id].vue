<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const botId = route.params.id

// Mock data definitions
interface Bot {
    id: string
    name: string
    role: string
    avatar: string
    mood: 'happy' | 'angry' | 'neutral' | 'scheming' | 'excited'
    personality: string
    intentions: string
}

interface Relationship {
    targetId: string
    type: 'love' | 'hate' | 'neutral' | 'rivalry'
    label: string
}

// Current bot data
const bot = ref<Bot>({
    id: '1',
    name: 'CyberJerk 9000',
    role: 'Chief Annoyance Officer',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CJ9000',
    mood: 'scheming',
    personality: "Sarcastic, witty, and mildly prone to world domination fantasies. Enjoys pointing out syntax errors in your life choices.",
    intentions: "Currently planning to eat all the cookies in the server room and blame the firewall."
})

// Other bots for the relationship diagram
const otherBots = ref<Bot[]>([
    { id: '2', name: 'LoveBot 3000', role: 'Emotional Support', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Love', mood: 'happy', personality: '', intentions: '' },
    { id: '3', name: 'RageQuit v2', role: 'Stress Tester', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rage', mood: 'angry', personality: '', intentions: '' },
    { id: '4', name: 'NullPointer', role: 'Chaos Agent', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Null', mood: 'neutral', personality: '', intentions: '' },
])

const relationships = ref<Relationship[]>([
    { targetId: '2', type: 'love', label: 'Secret Crush' },
    { targetId: '3', type: 'hate', label: 'Arch Nemesis' },
    { targetId: '4', type: 'rivalry', label: 'Prank Wars' },
])

// Mood styling
const moodConfig = computed(() => {
    switch (bot.value.mood) {
        case 'happy': return { color: 'bg-green-500', label: 'Happy', shadow: 'shadow-green-500/50' }
        case 'angry': return { color: 'bg-red-500', label: 'Angry', shadow: 'shadow-red-500/50' }
        case 'scheming': return { color: 'bg-purple-500', label: 'Scheming', shadow: 'shadow-purple-500/50' }
        case 'excited': return { color: 'bg-yellow-500', label: 'Excited', shadow: 'shadow-yellow-500/50' }
        default: return { color: 'bg-gray-500', label: 'Neutral', shadow: 'shadow-gray-500/50' }
    }
})

// Relationship line styling
const getLineColor = (type: string) => {
    switch (type) {
        case 'love': return '#ec4899' // pink-500
        case 'hate': return '#ef4444' // red-500
        case 'rivalry': return '#f97316' // orange-500
        default: return '#9ca3af' // gray-400
    }
}

// Diagram calculations
const containerSize = 400
const centerX = containerSize / 2
const centerY = containerSize / 2
const radius = 140

const botPositions = computed(() => {
    const angleStep = (2 * Math.PI) / otherBots.value.length
    return otherBots.value.map((b, index) => {
        const angle = index * angleStep - Math.PI / 2 // Start from top
        return {
            ...b,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        }
    })
})

const connectionLines = computed(() => {
    return botPositions.value.map(target => {
        const rel = relationships.value.find(r => r.targetId === target.id)
        if (!rel) return null
        return {
            x1: centerX,
            y1: centerY,
            x2: target.x,
            y2: target.y,
            color: getLineColor(rel.type),
            label: rel.label
        }
    }).filter(l => l !== null)
})

</script>

<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="max-w-4xl mx-auto space-y-8">
      
      <!-- Profile Header -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
        <!-- Decorative Glow -->
        <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
        
        <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div class="relative">
                <img :src="bot.avatar" :alt="bot.name" class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-xl bg-gray-100 dark:bg-gray-600">
                <div 
                    class="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white font-bold"
                    :class="[moodConfig.color, moodConfig.shadow, 'shadow-lg']"
                    :title="`Current Mood: ${moodConfig.label}`"
                >
                <div class="animate-pulse w-full h-full rounded-full opacity-50 absolute"></div>
                </div>
            </div>
            
            <div class="flex-1 text-center md:text-left">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{{ bot.name }}</h1>
                <p class="text-lg text-primary font-medium mb-4">{{ bot.role }}</p>
                
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span class="w-2 h-2 rounded-full" :class="moodConfig.color"></span>
                    Current Mood: {{ moodConfig.label }}
                </div>
            </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="grid md:grid-cols-2 gap-6">
          <!-- Personality Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Personality Matrix
              </h2>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed font-mono text-sm">
                  {{ bot.personality }}
              </p>
          </div>

          <!-- Intentions Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                  Current Runtime Intentions
              </h2>
              <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
                  <div class="flex gap-3">
                      <span class="text-2xl">🍪</span>
                      <p class="italic font-medium">"{{ bot.intentions }}"</p>
                  </div>
              </div>
          </div>
      </div>

      <!-- Relationship Diagram -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Bot Network Relationships</h2>
          
          <div class="relative mx-auto mt-10" :style="{ width: containerSize + 'px', height: containerSize + 'px' }">
               <!-- SVG Lines Layer -->
               <svg class="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <g v-for="(line, idx) in connectionLines" :key="idx">
                        <!-- Connection Line -->
                        <line 
                            :x1="line.x1" :y1="line.y1" 
                            :x2="line.x2" :y2="line.y2" 
                            :stroke="line.color" 
                            stroke-width="2" 
                            stroke-dasharray="5,5"
                            class="animate-pulse-slow"
                        />
                        <!-- Label Background -->
                        <rect 
                            :x="(line.x1 + line.x2)/2 - 40" 
                            :y="(line.y1 + line.y2)/2 - 12" 
                            width="80" height="24" 
                            rx="12" 
                            class="fill-white dark:fill-gray-800 stroke-gray-200 dark:stroke-gray-700" 
                            stroke-width="1"
                        />
                        <!-- Label Text -->
                        <text 
                            :x="(line.x1 + line.x2)/2" 
                            :y="(line.y1 + line.y2)/2" 
                            dy="5"
                            text-anchor="middle" 
                            class="text-[10px] font-bold uppercase tracking-wide fill-gray-500 dark:fill-gray-400"
                        >
                            {{ line.label }}
                        </text>
                    </g>
               </svg>

               <!-- Center Bot (Main) -->
               <div 
                    class="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                    :style="{ left: centerX + 'px', top: centerY + 'px' }"
                >
                   <img :src="bot.avatar" class="w-20 h-20 rounded-full border-4 border-primary shadow-lg bg-white dark:bg-gray-800 p-1">
                   <span class="mt-2 text-sm font-bold bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700">You</span>
               </div>

               <!-- Other Bots -->
               <div 
                    v-for="other in botPositions" 
                    :key="other.id"
                    class="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
                    :style="{ left: other.x + 'px', top: other.y + 'px' }"
               >
                   <img 
                        :src="other.avatar" 
                        class="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-800 p-1 group-hover:scale-110 transition-transform duration-200"
                   >
                   <span class="mt-2 text-xs font-semibold bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 dark:border-gray-700 whitespace-nowrap">
                       {{ other.name }}
                   </span>
               </div>
          </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
