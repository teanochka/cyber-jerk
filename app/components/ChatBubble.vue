<script setup lang="ts">
import type { ChatMessage, AgentState } from '~/types/chat'
import { formatTime } from '~/utils/agentStyles'

defineProps<{
  msg: ChatMessage
  avatarUrl: string
}>()
</script>

<template>
  <div :class="{ 'flex justify-end': msg.sender === 'user' }">
    <div
      class="flex items-start gap-2.5 max-w-[75%] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700/50 transition-all"
      :class="msg.sender === 'user'
        ? 'bg-primary/10 dark:bg-primary/20 ml-auto'
        : 'bg-white dark:bg-gray-800'"
    >
      <NuxtLink
        v-if="msg.sender !== 'user'"
        :to="`/agent/${msg.sender}`"
        class="flex-shrink-0 hover:scale-110 transition-transform"
      >
        <img
          :src="avatarUrl"
          :alt="msg.senderName"
          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600"
        />
      </NuxtLink>
      <div class="flex flex-col gap-1 min-w-0">
        <div class="flex items-center gap-2">
          <NuxtLink
            v-if="msg.sender !== 'user'"
            :to="`/agent/${msg.sender}`"
            class="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
          >{{ msg.senderName }}</NuxtLink>
          <span v-else class="text-sm font-semibold text-gray-900 dark:text-white">{{ msg.senderName }}</span>
          <span class="text-xs text-gray-400">{{ formatTime(msg.timestamp) }}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">{{ msg.text }}</p>
      </div>
    </div>
  </div>
</template>