# Zfy Example

A simple example demonstrating how to use Zfy for state management with React.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Example Usage

This example demonstrates the clean Zfy API:

```typescript
import { createStore } from '@colorfy-software/zfy'

// Create a store
const userStore = createStore('user', {
  likes: 0,
})

// Use in a component with clean selector API
function App() {
  // Selector receives data directly - no need for data.data.likes
  const likes = userStore((data) => data.likes)
  
  const updateLikes = userStore.getState().update
  
  return (
    <div>
      <h1>Likes: {likes}</h1>
      <button onClick={() => updateLikes((data) => data.likes += 1)}>
        Increment
      </button>
    </div>
  )
}
```

See the full example in `src/App.tsx`.

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Zfy** - State management with Zustand
