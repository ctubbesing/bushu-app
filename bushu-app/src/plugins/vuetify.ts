import { createVuetify, type ThemeDefinition } from 'vuetify'

const defaultColors: ThemeDefinition['colors'] = {
  'background': 'hsl(192, 71%, 77%)',
  'app-gray': 'hsl(208, 7%, 46%)',
  'translucent-theme-weak': 'rgba(255, 255, 255, 0.333)',
  'translucent-theme-strong': '#fff9',
}

const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    ...defaultColors,
  },
}

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    ...defaultColors,
    'background': 'hsl(192, 30%, 25%)',
    'app-gray': 'hsl(208, 7%, 16%)',
    'translucent-theme-weak': '#0005',
    'translucent-theme-strong': '#0009',
  },
}

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
      darkTheme,
    },
  },
  defaults: {
    global: {
      hideDetails: 'auto',
    },
  },
})

export default vuetify

export const toggleTheme = () => {
  const newTheme = vuetify.theme.global.name.value === 'lightTheme' ? 'darkTheme' : 'lightTheme'
  vuetify.theme.global.name.value = newTheme
}
