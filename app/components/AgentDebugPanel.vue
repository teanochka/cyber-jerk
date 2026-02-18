<script setup lang="ts">
import type { AgentState } from '~/types/chat'
import { moodColor, relationshipColor } from '~/utils/agentStyles'
import { isCustomAgent } from '~/composables/useCustomAgents'

defineProps<{
  agents: AgentState[]
  modelReady: boolean
  modelLoading: boolean
  modelProgress: number
  cycleRunning: boolean
  currentAgentIndex: number
}>()

const emit = defineEmits<{
  createBot: [{
    name: string
    systemPrompt: string
    avatarSeed: string
    color: string
  }]
  removeBot: [agentId: string]
  sendMessageToBot: [agentName: string]
}>()

const showCreateForm = ref(false)

function handleCreate(data: {
  name: string
  systemPrompt: string
  avatarSeed: string
  color: string
}) {
  emit('createBot', data)
  showCreateForm.value = false
}
</script>

<template>
  <aside class="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-y-auto flex-shrink-0">
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent Dashboard</h2>
        <button
          id="create-bot-btn"
          @click="showCreateForm = !showCreateForm"
          class="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all"
          :class="showCreateForm
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
            : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'"
        >
          <svg class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-45': showCreateForm }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          {{ showCreateForm ? 'Cancel' : 'Add Bot' }}
        </button>
      </div>

      <!-- Bot Creation Form -->
      <transition name="expand">
        <CreateBotForm
          v-if="showCreateForm"
          @create="handleCreate"
          @cancel="showCreateForm = false"
        />
      </transition>

      <!-- Model Status -->
      <div class="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-2 h-2 rounded-full" :class="modelReady ? 'bg-green-500' : modelLoading ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'"></div>
          <span class="text-xs font-medium text-gray-600 dark:text-gray-300">
            {{ modelReady ? 'Model Ready' : modelLoading ? `Loading ${modelProgress}%` : 'Model Not Loaded' }}
          </span>
        </div>
        <div v-if="modelLoading" class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
          <div class="bg-primary h-1.5 rounded-full transition-all duration-300" :style="{ width: modelProgress + '%' }"></div>
        </div>
      </div>

      <!-- Agent Cards -->
      <div v-for="agent in agents" :key="agent.id"
        class="p-3 rounded-lg border shadow-sm transition-all"
        :class="cycleRunning && agents[currentAgentIndex]?.id === agent.id
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 ring-1 ring-amber-400/30'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'"
      >
        <div class="flex items-center gap-2 mb-2">
          <NuxtLink :to="`/agent/${agent.id}`" class="flex-shrink-0 hover:scale-110 transition-transform">
            <img :src="agent.avatarUrl" :alt="agent.name" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600" />
          </NuxtLink>
          <div class="flex-1 min-w-0">
            <NuxtLink :to="`/agent/${agent.id}`" class="text-sm font-bold text-gray-900 dark:text-white truncate block hover:text-primary dark:hover:text-primary transition-colors">{{ agent.name }}</NuxtLink>
            <span
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border"
              :class="moodColor(agent.mood)"
            >
              {{ agent.mood }}
            </span>
          </div>
          <!-- Send Message button -->
          <button
            @click="$emit('sendMessageToBot', agent.name)"
            class="p-1 text-gray-400 hover:text-primary transition-colors rounded hover:bg-primary/10 flex-shrink-0"
            title="Send message to bot"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </button>

          <!-- Delete button for custom agents -->
          <button
            v-if="isCustomAgent(agent.id)"
            @click="$emit('removeBot', agent.id)"
            class="p-1 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/10 flex-shrink-0"
            title="Remove bot"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>

        <!-- Last Reflection -->
        <div v-if="agent.lastReflection" class="mt-2 p-2 rounded bg-gray-100 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300 italic">
          "{{ agent.lastReflection }}"
        </div>

        <!-- Relationships -->
        <div class="mt-2 space-y-1">
          <div
            v-for="rel in agent.relationships"
            :key="rel.targetId"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-gray-500 dark:text-gray-400">{{ rel.targetName }}</span>
            <span class="font-semibold" :class="relationshipColor(rel.status)">{{ rel.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 600px;
}
</style>
