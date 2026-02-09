import { useState, useEffect } from 'react'

export type TabValue = 'user' | 'theme' | 'preferences'

const validTabs: TabValue[] = ['user', 'theme', 'preferences']

export function useTabFromUrl(defaultTab: TabValue = 'user') {
  // Initialize selected tab from URL query params
  const [selectedTab, setSelectedTab] = useState<TabValue>(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')

    if (tabParam && validTabs.includes(tabParam as TabValue)) {
      return tabParam as TabValue
    }

    return defaultTab
  })

  // Update URL query params when tab changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('tab', selectedTab)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [selectedTab])

  return [selectedTab, setSelectedTab] as const
}
