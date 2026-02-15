<script setup lang="ts">
const { loggedIn, user, fetch: refreshSession } = useUserSession()
const credentials = reactive({
  email: '',
  password: '',
})
async function login() {
  $fetch('/api/auth/login', {
    method: 'POST',
    body: credentials
  })
  .then(async () => {
    await refreshSession()
    await navigateTo('/')
  })
  .catch(() => alert('Неверно введены данные'))
}
</script>

<template>
    <section class="p-8 max-w-5xl mx-auto min-h-screen">
        <div class="flex gap-8 items-start">
            <form class="flex flex-col gap-6 w-full" @submit.prevent="login">
                <h2 class="text-3xl font-semibold text-gray-800">Вход</h2>

                <!-- Логин -->
                <div>
                    <label class="block mb-2 text-lg font-medium text-gray-700">Email</label>
                    <input type="text" placeholder="ivanov123@mail.com" v-model="credentials.email"
                        class="w-full text-lg border-2 border-cyan-400 rounded-xl px-3 py-2 shadow-sm focus:ring-2 text-gray-700 focus:ring-cyan-500" />
                </div>

                <!-- Пароль -->
                <div>
                    <label class="block mb-2 text-lg font-medium text-gray-700">Пароль</label>
                    <input type="password" placeholder="Введите пароль" v-model="credentials.password"
                        class="w-full text-lg border-2 border-cyan-400 rounded-xl px-3 py-2 shadow-sm focus:ring-2 text-gray-700 focus:ring-cyan-500" />
                </div>

                <!-- Кнопка регистрации -->
                <div class="pt-4">
                    <button type="submit"
                        class="w-full py-3 bg-cyan-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-cyan-700 transition">
                        Войти
                    </button>
                </div>

                <p class="text-gray-500 text-lg font-semibold text-center">
                    Впервые здесь?
                    <a href="/register" class="text-cyan-500 hover:underline">Зарегистрироваться</a>
                </p>
            </form>
        </div>
    </section>
</template>