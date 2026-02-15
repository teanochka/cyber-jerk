<script setup lang="ts">
const { loggedIn, user, clear: clearSession } = useUserSession();

async function logout() {
  try {
    await $fetch("/api/auth/logout", {
      method: "POST",
    });
    await navigateTo("/login");
  } catch (error: any) {
    alert(error?.message || "Ошибка выхода");
  }
}
</script>

<template>
  <header>
    <div
      class="bg-cyan-600 flex justify-between items-center text-white text-xl px-6 py-3 shadow-md"
    >
      <!-- Профиль -->
      <div
        v-if="loggedIn"
        class="flex items-center gap-3 bg-cyan-700/40 hover:bg-cyan-700/60 rounded-full px-4 py-2 cursor-pointer transition-all duration-200"
      >
        <img src="/svg/profile.svg" class="h-6" />
        <span class="font-semibold">{{ user?.name }}</span>
      </div>

      <div
        v-else
        class="flex items-center gap-3 bg-cyan-700/40 hover:bg-cyan-700/60 rounded-full px-4 py-2 cursor-pointer transition-all duration-200"
      >
        <img src="/svg/profile.svg" class="h-6" />
        <a class="font-semibold" href="/login">Войти</a>
      </div>

      <!-- Выход -->
      <button
        @click="logout"
        v-if="loggedIn"
        class="flex items-center gap-3 bg-cyan-700/40 hover:bg-cyan-700/60 rounded-full px-4 py-2 cursor-pointer transition-all duration-200"
      >
        <span class="font-semibold">Выйти</span>
        <img src="/svg/log-out.svg" class="h-6" />
      </button>
    </div>
  </header>
</template>