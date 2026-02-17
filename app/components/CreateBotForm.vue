<script setup lang="ts">
import { ref, computed } from 'vue'
import { COLOR_OPTIONS, avatarUrl } from '~/utils/agentStyles'

const emit = defineEmits<{
  create: [{
    name: string
    systemPrompt: string
    avatarSeed: string
    color: string
  }]
  cancel: []
}>()

const name = ref('')
const prompt = ref('')
const seed = ref('')
const color = ref('bg-pink-500')

const avatarPreviewUrl = computed(() => {
  const s = seed.value.trim() || 'default'
  return avatarUrl(s)
})

function randomizeSeed() {
  seed.value = Math.random().toString(36).substring(2, 10)
}

function handleSubmit() {
  if (!name.value.trim() || !prompt.value.trim()) return
  emit('create', {
    name: name.value.trim(),
    systemPrompt: prompt.value.trim(),
    avatarSeed: seed.value.trim() || name.value.trim(),
    color: color.value,
  })
  name.value = ''
  prompt.value = ''
  seed.value = ''
  color.value = 'bg-pink-500'
}
</script>

<template>
  <div class="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 space-y-3">
    <h3 class="text-sm font-bold text-gray-900 dark:text-white">Создать нового бота</h3>

    <!-- Avatar Preview + Seed -->
    <div class="flex items-center gap-3">
      <img
        :src="avatarPreviewUrl"
        alt="Avatar preview"
        class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
      />
      <div class="flex-1 space-y-1">
        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">Avatar Seed</label>
        <div class="flex gap-1">
          <input
            id="bot-avatar-seed"
            v-model="seed"
            type="text"
            placeholder="e.g. CoolBot"
            class="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary/50"
          />
          <button
            type="button"
            @click="randomizeSeed"
            class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Randomize"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Name -->
    <div>
      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label>
      <input
        id="bot-name"
        v-model="name"
        type="text"
        placeholder="e.g. Pixel"
        class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary/50"
      />
    </div>

    <!-- System Prompt -->
    <div>
      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">System Prompt *</label>
      <textarea
        id="bot-prompt"
        v-model="prompt"
        rows="3"
        placeholder="Describe personality, tone, quirks..."
        class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary/50 resize-none"
      ></textarea>
    </div>

    <!-- Color -->
    <div>
      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Color</label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="c in COLOR_OPTIONS"
          :key="c.value"
          type="button"
          @click="color = c.value"
          class="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
          :class="color === c.value ? 'border-white dark:border-white ring-2 ring-primary scale-110' : 'border-transparent'"
          :style="{ backgroundColor: c.preview }"
          :title="c.label"
        />
      </div>
    </div>

    <!-- Submit -->
    <button
      id="confirm-create-bot"
      @click="handleSubmit"
      :disabled="!name.trim() || !prompt.trim()"
      class="w-full py-2 text-sm font-bold rounded-lg transition-all shadow-sm bg-gradient-to-r from-primary to-cyan-500 text-white hover:shadow-md hover:from-primary-hover hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Create Bot
    </button>
  </div>
</template>
