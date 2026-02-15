<template>
  <div class="px-4 py-16 sm:px-6 lg:px-8">
    <!-- Hero Section -->
    <div class="mx-auto max-w-7xl">
      <div class="grid lg:grid-cols-7 lg:gap-x-8 xl:gap-x-12 items-center">
        <div class="lg:col-span-3 text-center lg:text-left">
          <h1 class="block text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
            CyberJerk <span class="text-primary">App</span>
          </h1>
          <p class="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Команда Spaghetti Source. Creating awesome things with vibrant colors and dark mode.
          </p>

          <div class="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:gap-3 lg:justify-start justify-center">
            <a class="w-full sm:w-auto py-3 px-6 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-primary to-cyan-500 text-white hover:shadow-lg hover:from-primary-hover hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-md" href="/register">
              Попробовать сейчас
            </a>
            <a class="w-full sm:w-auto py-3 px-6 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all shadow-sm" href="#">
              Узнать больше
            </a>
          </div>
        </div>

        <div class="lg:col-span-4 mt-10 lg:mt-0 relative">
           <!-- Decorative blob -->
           <div class="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur-2xl opacity-30 dark:opacity-50 -z-10"></div>
           <img class="w-full rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800" src="/pattern.png" alt="Hero Image">
        </div>
      </div>
    </div>

    <!-- FAQ Section (Inspired by user snippet) -->
    <div class="mx-auto max-w-3xl mt-24">
      <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Часто задаваемые вопросы</h2>
      
      <div class="space-y-4">
        <details class="group [&_summary::-webkit-details-marker]:hidden" open>
          <summary class="flex items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-900 cursor-pointer hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
            <h2 class="text-lg font-medium">Как это работает?</h2>
            <svg class="size-5 shrink-0 transition-transform duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </summary>
          <p class="px-4 pt-4 text-gray-500 leading-relaxed dark:text-gray-400">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ab hic veritatis molestias culpa in, recusandae laboriosam neque aliquid libero nesciunt voluptate dicta quo officiis explicabo consequuntur distinctio corporis earum similique!
          </p>
        </details>

        <details class="group [&_summary::-webkit-details-marker]:hidden">
          <summary class="flex items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-900 cursor-pointer hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
            <h2 class="text-lg font-medium">Можно ли использовать темную тему?</h2>
            <svg class="size-5 shrink-0 transition-transform duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </summary>
          <p class="px-4 pt-4 text-gray-500 leading-relaxed dark:text-gray-400">
            Да! Наше приложение полностью поддерживает темный режим. Переключите его в меню навигации, чтобы снизить нагрузку на глаза в ночное время.
          </p>
        </details>

        <details class="group [&_summary::-webkit-details-marker]:hidden">
          <summary class="flex items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-900 cursor-pointer hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
            <h2 class="text-lg font-medium">Это бесплатно?</h2>
            <svg class="size-5 shrink-0 transition-transform duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </summary>
          <p class="px-4 pt-4 text-gray-500 leading-relaxed dark:text-gray-400">
             Абсолютно. Регистрируйтесь и пользуйтесь всеми функциями бесплатно. Мы ценим наших пользователей.
          </p>
        </details>
      </div>
    </div>
  </div>
</template>