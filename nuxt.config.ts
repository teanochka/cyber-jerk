// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'nuxt-auth-utils',
    '@nuxthub/core',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
  ],
  css: ['~/assets/css/main.css'],
  hub: {
    db: 'sqlite'
  },
  runtimeConfig: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    },
    public: {}
  }
})