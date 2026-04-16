import vuetify from './vuetify'
import router  from '@/router'
import { createPinia } from 'pinia'

export function registerPlugins(app) {
  app
    .use(createPinia())
    .use(vuetify)
    .use(router)
}
