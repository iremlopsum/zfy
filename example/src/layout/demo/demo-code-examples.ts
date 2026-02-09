export const storeCode = `import { createStore } from '@iremlopsum/zfy';
import { createJSONStorage } from 'zustand/middleware';

// User Store
interface UserState {
  name: string;
  age: number;
}

const userStore = createStore<UserState>('user', {
  name: 'Alice',
  age: 25
});

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark';
}

const themeStore = createStore<ThemeState>('theme', {
  theme: 'dark'
});

// Preferences Store with persistence
interface PreferencesState {
  visitCount: number;
  notificationsEnabled: boolean;
  autoSave: boolean;
}

const preferencesStore = createStore<PreferencesState>(
  'preferences',
  {
    visitCount: 0,
    autoSave: true,
    notificationsEnabled: true
  },
  {
    persist: {
      name: 'zfy-preferences',
      storage: createJSONStorage(() => localStorage)
    }
  }
);`

export const usageCode = `// Using multiple stores in components
function MyComponent() {
  const user = userStore((data) => data);
  const theme = themeStore((data) => data.theme);
  const preferences = preferencesStore((data) => data);
  
  const updateUser = userStore.getState().update;
  
  const incrementAge = () => {
    updateUser((data) => {
      data.age += 1;  // ✨ Immer-powered updates
    });
  };
  
  return (
    <div>
      <p>{user.name} is {user.age} years old</p>
      <p>Visits: {preferences.visitCount}</p>
    </div>
  );
}`
