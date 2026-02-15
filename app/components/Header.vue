<script setup lang="ts">
const { loggedIn, user, clear: clearSession } = useUserSession()
const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function logout() {
  await clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <header class="bg-white dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
      <NuxtLink to="/" class="block text-primary dark:text-primary-hover">
        <span class="sr-only">Home</span>
        <!-- Simple text logo or SVG placeholder -->
        <h1 class="text-2xl font-bold tracking-tight">CyberJerk</h1>
      </NuxtLink>

      <div class="flex flex-1 items-center justify-end md:justify-between">
        <nav aria-label="Global" class="hidden md:block">
          <ul class="flex items-center gap-6 text-sm">
            <li><a class="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75" href="#">About</a></li>
            <li><a class="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75" href="#">Careers</a></li>
            <li><a class="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75" href="#">Services</a></li>
            <li><a class="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75" href="#">Projects</a></li>
          </ul>
        </nav>

        <div class="flex items-center gap-4">
          <!-- Theme Toggle -->
          <button @click="toggleTheme" class="rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-primary/10 hover:text-primary dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-primary/20 dark:hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50">
            <span v-if="colorMode.value === 'dark'">
              <!-- Sun Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </span>
            <span v-else>
              <!-- Moon Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            </span>
          </button>

          <div v-if="!loggedIn" class="sm:flex sm:gap-4">
            <NuxtLink to="/login" class="block rounded-lg bg-gradient-to-r from-primary to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:from-primary-hover hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-primary/50">
              Войти
            </NuxtLink>
            <NuxtLink to="/register" class="hidden rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white sm:block dark:border-primary-hover dark:text-primary-hover dark:hover:bg-primary-hover dark:hover:text-gray-900">
              Регистрация
            </NuxtLink>
          </div>

          <div v-else class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
              {{ user?.name }}
            </span>
            <button @click="logout" class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40">
              <span>Выйти</span>
              <!-- Logout Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>