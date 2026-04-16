import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const pixxgramLight = {
  dark: false,
  colors: {
    background: '#F7F5F2',
    surface:    '#FFFFFF',
    primary:    '#1A1A2E',
    secondary:  '#C9A84C',
    accent:     '#E8623A',
    error:      '#D32F2F',
    warning:    '#F57C00',
    info:       '#1565C0',
    success:    '#2E7D32',
  },
}

const pixxgramDark = {
  dark: true,
  colors: {
    background: '#0D0D1A',
    surface:    '#16213E',
    primary:    '#C9A84C',
    secondary:  '#E8623A',
    accent:     '#4FC3F7',
    error:      '#EF5350',
    warning:    '#FFA726',
    info:       '#42A5F5',
    success:    '#66BB6A',
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'pixxgramLight',
    themes: { pixxgramLight, pixxgramDark },
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VCard: { rounded: 'xl', elevation: 0 },
    VTextField: { variant: 'outlined', rounded: 'lg', density: 'comfortable' },
    VSelect: { variant: 'outlined', rounded: 'lg', density: 'comfortable' },
  },
})
