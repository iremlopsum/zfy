# Zfy Example

A comprehensive interactive demo showcasing Zfy state management with React. This example features three different stores, persistence, theme switching, and a modern UI to demonstrate Zfy's capabilities.

## Getting Started

Install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Build for production:

```bash
yarn build
```

Preview production build:

```bash
yarn preview
```

## What's Included

This example demonstrates three different stores with various features:

### 1. User Store

- Basic state management with name and age
- Immer-powered updates (mutate state directly)
- Reset functionality

```typescript
const userStore = createStore<UserState>('user', {
  name: 'Alice',
  age: 25,
})

// Usage in components
const user = userStore((data) => data)
const updateUser = userStore.getState().update

updateUser((data) => {
  data.age += 1 // ✨ Mutate directly with Immer
})
```

### 2. Theme Store

- Light/dark mode switching
- System preference detection
- Global state shared across all components

```typescript
const themeStore = createStore<ThemeState>('theme', {
  theme: getInitialTheme(),
})

// Theme updates reflect instantly across the entire app
const theme = themeStore((data) => data.theme)
```

### 3. Preferences Store (with Persistence)

- Visit count tracking
- User preferences (notifications, auto-save)
- **localStorage persistence** - state survives page refreshes

```typescript
const preferencesStore = createStore<PreferencesState>(
  'preferences',
  {
    visitCount: 0,
    autoSave: true,
    notificationsEnabled: true,
  },
  {
    persist: {
      name: 'zfy-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  }
)
```

## Features Demonstrated

- ✅ **Multiple Stores** - Three independent stores working together
- ✅ **Immer Integration** - Mutate state directly with clean syntax
- ✅ **Persistence** - localStorage integration with Zustand middleware
- ✅ **TypeScript** - Full type safety throughout
- ✅ **Selectors** - Efficient component re-renders with granular selectors
- ✅ **Reset Functionality** - Reset stores to initial state
- ✅ **Interactive UI** - Tabbed interface showing real-time state updates

## Project Structure

```
src/
├── App.tsx                    # Main app component
├── stores/
│   ├── user-store.ts          # User state management
│   ├── theme-store.ts         # Theme state with system detection
│   └── preferences-store.ts   # Persisted preferences
├── layout/
│   ├── Hero.tsx               # Landing hero section
│   ├── Features.tsx           # Feature highlights
│   ├── StateDemo.tsx          # Interactive demo with three stores
│   ├── CodeBlock.tsx          # Syntax-highlighted code display
│   └── Footer.tsx             # Footer with links
└── components/
    ├── button.tsx             # Button component
    ├── card.tsx               # Card component
    ├── input.tsx              # Input component
    ├── label.tsx              # Label component
    ├── switch.tsx             # Switch component
    └── tabs.tsx               # Tabs component
```

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Zfy** - State management powered by Zustand
- **Lucide React** - Icon library

## Try It Out

1. Run the dev server and open the app
2. Navigate through the three tabs (User, Theme, Preferences)
3. Make changes to the state
4. Toggle the theme to see instant updates
5. Refresh the page to see preferences persist!
6. Click the code button to see the implementation
