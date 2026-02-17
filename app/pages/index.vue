<script setup lang="ts">
useSeoMeta({
  title: 'Cyber Jerk - AI Симуляция',
  description: 'Приложение для симуляции взаимодействия с чат-ботами с системой отношений и настроения.',
})

const features = [
  {
    title: 'Умная симуляция',
    description: 'Продвинутые алгоритмы взаимодействия, имитирующие реальное человеческое общение.',
    svg: 'M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 21v-1.5M15.75 21v-1.5M15.75 3v1.5M3.75 5.25h16.5c.414 0 .75.336.75.75v12c0 .414-.336.75-.75.75H3.75a.75.75 0 01-.75-.75V6c0-.414.336-.75.75-.75zM6 9.75h1.5v1.5H6V9.75zm0 3.75h1.5v1.5H6v-1.5zm3.75-3.75h1.5v1.5h-1.5V9.75zm0 3.75h1.5v1.5h-1.5v-1.5zm3.75-3.75h1.5v1.5h-1.5V9.75zm0 3.75h1.5v1.5h-1.5v-1.5z'
  },
  {
    title: 'Система отношений',
    description: 'Боты запоминают ваши действия. Отношения развиваются от вражды до дружбы.',
    svg: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
  },
  {
    title: 'Эмоциональный отклик',
    description: 'Динамическая система настроения влияет на ответы ботов в реальном времени.',
    svg: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
  },
]

const techStack = [
  { name: 'Nuxt', logo: '/png/nuxt_logo.png' },
  { name: 'Node.js', logo: '/png/nodejs_logo.png' },
  { name: 'HuggingFace', logo: '/png/huggingface_logo.png' },
]

// Mock Chat Data
const mockMessages = [
  {
    id: 1,
    sender: 'bot',
    name: 'Jarvis',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jarvis',
    text: 'Как же мне надоел Майкл!',
    time: '14:20'
  },
  {
    id: 2,
    sender: 'bot',
    name: 'Michael',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Michael',
    text: 'Я еще здесь, если что.',
    time: '14:20'
  },
  {
    id: 3,
    sender: 'user',
    name: 'Вы',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    text: 'Хватит ругаться',
    time: '14:21'
  },
  {
    id: 4,
    sender: 'bot',
    name: 'Jarvis',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jarvis',
    text: 'Я не буду слушаться человека!!!!',
    time: '14:21'
  }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 selection:bg-primary/20 selection:text-primary transition-colors duration-500">
    <!-- Hero Section -->
    <section class="relative isolate pt-14">
      <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#ff80b5] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" />
      </div>

      <div class="py-24 sm:py-32 lg:pb-40">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div class="mx-auto max-w-2xl text-center">
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl animate-fade-in-up">
              Cyber Jerk <span class="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">AI</span>
            </h1>
            <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 animate-fade-in-up delay-100">
              Уникальное приложение для симуляции взаимодействия с чат-ботами. Исследуйте глубокие системы отношений и настроения, создавая неповторимые сценарии общения.
            </p>
            <div class="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up delay-200">
              <NuxtLink
                to="/chat"
                class="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-300 transform hover:-translate-y-1"
              >
                Начать общение
              </NuxtLink>
              <a href="#features" class="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary transition-colors flex items-center gap-1">
                Узнать больше <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <!-- Chat Mockup -->
          <div class="mt-16 flow-root sm:mt-24 animate-fade-in-up delay-300">
            <div class="relative -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 dark:bg-white/5 dark:ring-white/10 backdrop-blur-3xl">
              <div class="relative rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10 overflow-hidden">
                <!-- Mock Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                   <div class="flex items-center gap-3">
                      <span class="font-semibold text-gray-900 dark:text-white">Чат с ботами</span>
                      <div class="flex -space-x-2">
                         <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Michael" class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100" />
                         <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Jarvis" class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100" />
                      </div>
                   </div>
          <button
            class="px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-md bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed'"
          >
            <span class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Michael thinking...
            </span>
          </button>
                </div>

                <!-- Mock Messages -->
                <div class="p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-[300px]">
                  <div v-for="msg in mockMessages" :key="msg.id" class="flex" :class="{ 'justify-end': msg.sender === 'user' }">
                    <div 
                      class="flex items-start gap-3 max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl shadow-sm transition-all hover:shadow-md"
                      :class="msg.sender === 'user' 
                        ? 'bg-primary/10 dark:bg-primary/20 flex-row-reverse' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'"
                    >
                      <img :src="msg.avatar" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      <div class="flex flex-col gap-1 min-w-0" :class="{ 'items-end': msg.sender === 'user' }">
                         <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ msg.name }}</span>
                            <span class="text-xs text-gray-400">{{ msg.time }}</span>
                         </div>
                         <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ msg.text }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Typing Indicator -->
                  <div class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 animate-pulse pl-2">
                    <div class="flex space-x-1">
                      <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                      <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                      <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                    <span>Jarvis печатает...</span>
                  </div>
                </div>

                <!-- Mock Input -->
                <div class="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                   <div class="relative">
                      <input type="text" placeholder="Напишите сообщение..." class="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-lg pl-4 pr-12 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50" disabled />
                      <button class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-md">
                         <svg class="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                      </button>
                   </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
      
      <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" />
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 sm:py-32 bg-white dark:bg-gray-900 transition-colors">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Больше, чем просто чат
          </p>
          <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Мы создали экосистему, где ИИ обладает характером, памятью и эмоциями.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div v-for="feature in features" :key="feature.title" class="group relative flex flex-col items-start bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-gray-900/50 hover:-translate-y-1">
              <div class="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="feature.svg" />
                </svg>
              </div>
              <dt class="text-xl font-bold leading-7 text-gray-900 dark:text-white group-hover:text-primary transition-colors">{{ feature.title }}</dt>
              <dd class="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p class="flex-auto">{{ feature.description }}</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="py-24 sm:py-32 relative overflow-hidden">
      <div class="absolute inset-0 -z-10 bg-gray-50 dark:bg-gray-950/50"></div>
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 class="text-center text-3xl font-black leading-8 text-gray-900 dark:text-white mb-16 tracking-tight">
          Наш стэк технологий
        </h2>
        <div class="mx-auto grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-3 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div v-for="tech in techStack" :key="tech.name" class="flex flex-col items-center gap-6 group">
            <div class="relative h-24 w-full flex items-center justify-center p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group-hover:border-primary/30 group-hover:shadow-lg dark:group-hover:shadow-primary/10 transition-all duration-300 transform group-hover:-translate-y-1">
               <img
                  class="h-full w-auto object-contain transition-all duration-300 grayscale group-hover:grayscale-0 dark:brightness-200 dark:group-hover:brightness-100"
                  :src="tech.logo"
                  :alt="tech.name"
               />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>