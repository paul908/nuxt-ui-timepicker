import { createResolver, defineNuxtModule, addComponentsDir, addVitePlugin, addPlugin, installModule, hasNuxtModule } from '@nuxt/kit'

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

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addComponentsDir({
      path: resolve(__dirname, './runtime/components')
    })

    nuxt.options.css.push(resolve('./runtime/assets/css/main.css'))
  },
})
