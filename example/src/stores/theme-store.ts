import { createStore } from '@colorfy-software/zfy'

interface ThemeState {
  theme: 'light' | 'dark'
}

// Detect system theme preference
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return systemPrefersDark ? 'dark' : 'light'
  }
  return 'dark'
}

// Create the theme store with the library
const themeStore = createStore<ThemeState>('theme', {
  theme: getInitialTheme(),
})

// Default export the store instance
export default themeStore
