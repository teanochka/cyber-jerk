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
    db: 'mysql'
  },
  runtimeConfig: {
    public: {
      MODEL_ID: 'onnx-community/Llama-3.2-1B-Instruct',
      max_tokens: 400,
    }
  }
})