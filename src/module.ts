import {defineNuxtModule, createResolver, addComponentsDir} from '@nuxt/kit'
import {resolve} from "pathe";

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-ui-timepicker',
    configKey: 'timepicker',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addComponentsDir({
      path: resolve(__dirname, 'runtime/components'),
      watch: _nuxt.options.dev
    })
  },
})
