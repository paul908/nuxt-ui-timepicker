export default defineNuxtConfig({
  modules: ['@nuxt/ui', '../src/module'],
  css: ['./assets/css/main.css'],
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  devServer: {
    port: 3000,
    host: '0.0.0.0',
    url: 'http://0.0.0.0:3000'
  },
  compatibilityDate: '2025-04-04',
})
