// import { defu } from 'defu'
import { createResolver, defineNuxtModule, addComponentsDir, addVitePlugin, addPlugin, installModule, hasNuxtModule } from '@nuxt/kit'
// import { defaultOptions, getDefaultUiConfig, resolveColors } from './defaults'


// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Prefix for components
   * @defaultValue `U`
   * @link https://ui.nuxt.com/getting-started/installation/nuxt#prefix
   */
  prefix?: string

  /**
   * Enable or disable `@nuxt/fonts` module
   * @defaultValue `true`
   * @link https://ui.nuxt.com/getting-started/installation/nuxt#fonts
   */
  fonts?: boolean

  /**
   * Enable or disable `@nuxtjs/color-mode` module
   * @defaultValue `true`
   * @link https://ui.nuxt.com/getting-started/installation/nuxt#colormode
   */
  colorMode?: boolean

  /**
   * Customize how the theme is generated
   * @link https://ui.nuxt.com/getting-started/theme
   */
  theme?: {
    /**
     * Define the color aliases available for components
     * @defaultValue `['primary', 'secondary', 'success', 'info', 'warning', 'error']`
     * @link https://ui.nuxt.com/getting-started/installation/nuxt#themecolors
     */
    colors?: string[]

    /**
     * Enable or disable transitions on components
     * @defaultValue `true`
     * @link https://ui.nuxt.com/getting-started/installation/nuxt#themetransitions
     */
    transitions?: boolean
  }
}
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
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // options.theme = options.theme || {}
    // options.theme.colors = resolveColors(options.theme.colors)
    //
    // nuxt.options.ui = options
    //
    // nuxt.options.alias['#ui'] = resolve('./runtime')
    //
    // nuxt.options.appConfig.ui = defu(nuxt.options.appConfig.ui || {}, getDefaultUiConfig(options.theme.colors))
    //
    //
    // async function registerModule(name: string, key: string, options: Record<string, any>) {
    //   if (!hasNuxtModule(name)) {
    //     await installModule(name, options)
    //   } else {
    //     (nuxt.options as any)[key] = defu((nuxt.options as any)[key], options)
    //   }
    // }

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
      path: resolve(__dirname, './runtime/components')
    })

    nuxt.options.css.push(resolve('./runtime/assets/css/main.css'))
    // nuxt.options.build.transpile.push(resolve('runtime'))
  },
})
