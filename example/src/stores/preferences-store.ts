import { createJSONStorage } from 'zustand/middleware'

import { createStore } from '@colorfy-software/zfy'

interface PreferencesState {
  autoSave: boolean
  visitCount: number
  notificationsEnabled: boolean
}

// Initial preferences data
const initialPreferencesData: PreferencesState = {
  visitCount: 0,
  autoSave: true,
  notificationsEnabled: true,
}

// Create the preferences store with persistence
const preferencesStore = createStore<PreferencesState>(
  'preferences',
  initialPreferencesData,
  {
    persist: {
      name: 'zfy-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  }
)

// Default export the store instance
export default preferencesStore
