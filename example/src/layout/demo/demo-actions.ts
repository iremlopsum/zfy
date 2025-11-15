import userStore from '../../stores/user-store'
import themeStore from '../../stores/theme-store'
import preferencesStore from '../../stores/preferences-store'

// User actions
export const incrementAge = () => {
  userStore.getState().update((data) => {
    data.age += 1
  })
}

export const decrementAge = () => {
  userStore.getState().update((data) => {
    data.age = Math.max(0, data.age - 1)
  })
}

export const updateName = (name: string) => {
  userStore.getState().update((data) => {
    data.name = name
  })
}

export const resetUser = () => {
  userStore.getState().reset()
}

// Theme actions
export const toggleTheme = () => {
  themeStore.getState().update((data) => {
    data.theme = data.theme === 'light' ? 'dark' : 'light'
  })
}

// Preferences actions
export const toggleNotifications = () => {
  preferencesStore.getState().update((data) => {
    data.notificationsEnabled = !data.notificationsEnabled
  })
}

export const toggleAutoSave = () => {
  preferencesStore.getState().update((data) => {
    data.autoSave = !data.autoSave
  })
}

export const resetPreferences = () => {
  preferencesStore.getState().reset()
}
