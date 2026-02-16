<script setup lang="ts">
import { ref } from 'vue'

const messages = ref([
  {
    id: 1,
    message: "Hey there! How's it going?",
    userName: "Bonnie Green",
    time: "11:46",
    backgroundColor: "bg-cyan-500"
  },
  {
    id: 2,
    message: "I'm doing great, thanks for asking! Just working on this new chat app.",
    userName: "You",
    time: "11:47", 
    backgroundColor: "bg-primary/10" // Differentiate own messages
  },
  {
    id: 3,
    message: "That sounds awesome! What tech stack are you using?",
    userName: "Bonnie Green",
    time: "11:48",
    backgroundColor: "bg-cyan-500"
  }
])

const newMessage = ref('')

const sendMessage = () => {
    if (!newMessage.value.trim()) return

    const now = new Date()
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')

    messages.value.push({
        id: Date.now(),
        message: newMessage.value,
        userName: "You",
        time: timeString,
        backgroundColor: "bg-primary/10"
    })
    newMessage.value = ''
}
</script>

<template>
    <div class="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto p-4">
        <!-- Chat Messages Area -->
        <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            <template v-for="msg in messages" :key="msg.id">
                <div :class="{'flex justify-end': msg.userName === 'You'}">
                    <ChatBubble 
                        :message="msg.message" 
                        :user-name="msg.userName" 
                        :time="msg.time" 
                        :background-color="msg.backgroundColor"
                    />
                </div>
            </template>
        </div>

        <!-- Input Area -->
        <div class="mt-auto">
            <form @submit.prevent="sendMessage" class="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <button type="button" class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                    </svg>
                </button>
                <input 
                    v-model="newMessage" 
                    type="text" 
                    placeholder="Write a message..." 
                    class="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500"
                >
                <div class="flex items-center gap-1">
                     <button type="button" class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                    <button type="submit" class="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newMessage.trim()">
                        <svg class="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>