<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()

const credentials = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

function clearErrors() {
  errors.email = ''
  errors.password = ''
}

async function login() {
  clearErrors()
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    await refreshSession()
    await navigateTo('/')
  } catch (err: any) {
    const data = err?.data?.data
    if (data?.field && data?.message) {
      ;(errors as any)[data.field] = data.message
    } else {
      errors.email = 'Произошла ошибка. Попробуйте снова.'
    }
  }
}
</script>

<template>
  <section class="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
    <div class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <form class="flex flex-col gap-6" @submit.prevent="login">
        <h2 class="text-center text-3xl font-bold text-gray-900 dark:text-white">Вход</h2>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="text"
            placeholder="ivanov123@mail.com"
            v-model="credentials.email"
            :class="[
              'w-full rounded-lg border px-4 py-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2',
              'bg-gray-50 dark:bg-gray-900 dark:text-white',
              errors.email 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20'
            ]"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Пароль</label>
          <input
            type="password"
            placeholder="Введите пароль"
            v-model="credentials.password"
            :class="[
              'w-full rounded-lg border px-4 py-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2',
              'bg-gray-50 dark:bg-gray-900 dark:text-white',
              errors.password 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20'
            ]"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
        </div>

        <button
          type="submit"
          class="w-full rounded-lg bg-gradient-to-r from-primary to-cyan-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:from-primary-hover hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          Войти
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Впервые здесь?
          <a href="/register" class="font-medium text-primary hover:underline hover:text-primary-hover">Зарегистрироваться</a>
        </p>
      </form>
    </div>
  </section>
</template>