<script setup lang="ts">
import type { NewUser } from '~/shared/types/user'

const { fetch: refreshSession } = useUserSession()

const registrationData = reactive<NewUser>({
  name: '',
  email: '',
  password: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
})

function clearErrors() {
  errors.name = ''
  errors.email = ''
  errors.password = ''
}

async function register() {
  clearErrors()
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: registrationData,
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
      <form class="flex flex-col gap-6" @submit.prevent="register">
        <h2 class="text-center text-3xl font-bold text-gray-900 dark:text-white">Регистрация</h2>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Имя</label>
          <input
            type="text"
            placeholder="Иванов Иван Иванович"
            v-model="registrationData.name"
            required
            :class="[
              'w-full rounded-lg border px-4 py-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2',
              'bg-gray-50 dark:bg-gray-900 dark:text-white',
              errors.name 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20'
            ]"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            placeholder="ivanov123@mail.com"
            v-model="registrationData.email"
            required
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
            v-model="registrationData.password"
            required
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
          Зарегистрироваться
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Уже есть аккаунт?
          <a href="/login" class="font-medium text-primary hover:underline hover:text-primary-hover">Войти</a>
        </p>
      </form>
    </div>
  </section>
</template>