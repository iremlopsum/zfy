# API Reference

## Quick Start

### Creating a Store

```typescript
import { createStore } from '@colorfy-software/zfy'

interface UserData {
  name: string
  likes: number
  email: string
}

const userStore = createStore<UserData>('user', {
  name: 'John',
  likes: 0,
  email: 'john@example.com',
})
```

## Using Stores in Components

### Basic Usage with Selectors

The store hook accepts a selector function that receives the store's data directly:

```typescript
import userStore from './stores/user-store'

function MyComponent() {
  // Select a single value
  const likes = userStore((data) => data.likes)
  
  // Select multiple values
  const user = userStore((data) => ({
    name: data.name,
    email: data.email,
  }))
  
  // Select the entire state
  const allData = userStore((data) => data)
  
  return <div>Likes: {likes}</div>
}
```

### Updating Store Data

```typescript
import userStore from './stores/user-store'

// Get the update function
const updateUser = userStore.getState().update

// Update data using Immer's draft state
updateUser((data) => {
  data.likes += 1
})

// Multiple updates
updateUser((data) => {
  data.name = 'Jane'
  data.email = 'jane@example.com'
})
```

### Accessing Store State Outside React

```typescript
// Get current state
const currentState = userStore.getState()
console.log(currentState.data) // { name: 'John', likes: 0, email: '...' }

// Access specific values
const likes = userStore.getState().data.likes

// Reset store to initial state
userStore.getState().reset()
```

## Advanced Usage

### Using Multiple Stores with initStores

```typescript
import { initStores, createStore } from '@colorfy-software/zfy'

const userStore = createStore('user', { name: 'John', likes: 0 })
const settingsStore = createStore('settings', { theme: 'dark', notifications: true })

const { stores, useStores } = initStores<{
  user: { name: string; likes: number }
  settings: { theme: string; notifications: boolean }
}>([userStore, settingsStore])

// In your component
function MyComponent() {
  // Use the useStores hook with clean selector API
  const userName = useStores('user', (data) => data.name)
  const theme = useStores('settings', (data) => data.theme)
  
  return (
    <div>
      <p>{userName}</p>
      <p>Theme: {theme}</p>
    </div>
  )
}
```

### With Persistence

```typescript
import { createStore } from '@colorfy-software/zfy'
import { createJSONStorage } from 'zustand/middleware'

const userStore = createStore(
  'user',
  { name: 'John', likes: 0 },
  {
    persist: {
      storage: createJSONStorage(() => localStorage),
    },
  }
)

// Use in component with clean selector API
function MyComponent() {
  const likes = userStore((data) => data.likes)
  
  return <div>Likes: {likes}</div>
}
```

### With Logger Middleware

```typescript
const userStore = createStore(
  'user',
  { name: 'John', likes: 0 },
  {
    log: true, // Enable logging for debugging
  }
)
```

### With Custom Equality Function

```typescript
import { shallow } from 'zustand/shallow'

function MyComponent() {
  // Use custom equality function to optimize re-renders
  const user = userStore(
    (data) => ({ name: data.name, email: data.email }),
    shallow
  )
  
  return <div>{user.name}</div>
}
```

## PersistGate Component

Wait for stores to rehydrate before rendering your app:

```typescript
import { PersistGate } from '@colorfy-software/zfy'

function App() {
  return (
    <PersistGate
      stores={[userStore, settingsStore]}
      loader={() => <div>Loading...</div>}
    >
      <YourApp />
    </PersistGate>
  )
}
```

## useRehydrate Hook

Check rehydration status programmatically:

```typescript
import { useRehydrate } from '@colorfy-software/zfy'

function MyComponent() {
  const isRehydrated = useRehydrate([userStore, settingsStore])
  
  if (!isRehydrated) {
    return <div>Loading...</div>
  }
  
  return <div>App is ready!</div>
}
```

## Key API Changes (v1.0.0+)

### Cleaner Selector API

**Before:**
```typescript
// Old API required accessing .data twice
const likes = userStore((state) => state.data.likes)
const userName = useStores('user', (state) => state.data.name)
```

**Now:**
```typescript
// New API - selector receives data directly
const likes = userStore((data) => data.likes)
const userName = useStores('user', (data) => data.name)
```

The selector function now receives your store's data directly, eliminating the redundant `.data` access. The internal store structure remains unchanged - this is purely a more ergonomic API for consumers.

### What Didn't Change

```typescript
// Getting state outside React still uses .getState().data
const currentLikes = userStore.getState().data.likes

// Update function still works the same way
userStore.getState().update((data) => {
  data.likes += 1
})

// Reset still works the same
userStore.getState().reset()
```

## Type Safety

All APIs are fully typed with TypeScript:

```typescript
interface UserData {
  name: string
  likes: number
  email: string
}

const userStore = createStore<UserData>('user', initialData)

// TypeScript knows what's available in data
const likes = userStore((data) => data.likes) // ✅ Type: number
const invalid = userStore((data) => data.invalid) // ❌ TypeScript error
```

## Full Example

```typescript
import { createStore } from '@colorfy-software/zfy'

// Define your data type
interface CounterData {
  count: number
  lastUpdated: Date
}

// Create store with initial data
const counterStore = createStore<CounterData>('counter', {
  count: 0,
  lastUpdated: new Date(),
})

// Component using the store
function Counter() {
  // Clean selector API - data is passed directly
  const count = counterStore((data) => data.count)
  
  const increment = () => {
    counterStore.getState().update((data) => {
      data.count += 1
      data.lastUpdated = new Date()
    })
  }
  
  const reset = () => {
    counterStore.getState().reset()
  }
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

## More Information

For comprehensive guides and additional examples, visit the [official documentation](https://colorfy-software.gitbook.io/zfy).

