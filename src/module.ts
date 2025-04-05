import { defu } from 'defu'
import { createResolver, defineNuxtModule, addComponentsDir, addVitePlugin, addPlugin, installModule, hasNuxtModule } from '@nuxt/kit'


// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-ui-timepicker',
    configKey: 'uiTimepicker',
    compatibility: {
      nuxt: '>=3.16.0'
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    async function registerModule(name: string, key: string, options: Record<string, any>) {
      if (!hasNuxtModule(name)) {
        await installModule(name, options)
      } else {
        (nuxt.options as any)[key] = defu((nuxt.options as any)[key], options)
      }
    }

    // await registerModule('nuxt', 'nuxt', {  })
    // await registerModule('culori', 'culori', {  })
    // await registerModule('tailwindcss', 'tailwindcss', {  })
    // await registerModule('@nuxt/ui', 'ui', { cssLayer: 'components' })
    // await registerModule('@nuxt/icon', 'icon', { cssLayer: 'components' })
    // await registerModule('@nuxt/fonts', 'fonts', { experimental: { processCSSVariables: true } })
    // await registerModule('@nuxtjs/color-mode', 'colorMode', { classSuffix: '', disableTransition: true })
    // await registerModule('@nuxtjs/tailwindcss', 'nuxtjs-tailwindcss', { classSuffix: '', disableTransition: true })


    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addComponentsDir({
      path: resolve(__dirname, './runtime/components'),
      watch: nuxt.options.dev
    })

    nuxt.options.css.push(resolve('./runtime/assets/css/main.css'))
  },
})
