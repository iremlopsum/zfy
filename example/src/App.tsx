import { useEffect } from 'react'

import { Hero } from './layout/Hero'
import { Footer } from './layout/Footer'
import { Features } from './layout/Features'
import { StateDemo } from './layout/StateDemo'

import themeStore from './stores/theme-store'
import preferencesStore from './stores/preferences-store'

const updatePreferences = preferencesStore.getState().update

export default function App() {
  const theme = themeStore((data) => data.theme)

  useEffect(() => {
    // Apply or remove the 'dark' class on the root element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    // Increment visit count on mount
    // Wait for store to be hydrated before incrementing
    const timer = setTimeout(() => {
      updatePreferences((state) => {
        state.visitCount++
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-zinc-950 text-zinc-100'
          : 'bg-zinc-50 text-zinc-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Hero theme={theme} />
        <Features theme={theme} />
        <StateDemo theme={theme} />
        <Footer theme={theme} />
      </div>
    </div>
  )
}
