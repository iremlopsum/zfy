import { createStore } from '@colorfy-software/zfy'

interface UserState {
  name: string
  age: number
}

// Initial user data
const initialUserData: UserState = {
  name: 'Alice',
  age: 25,
}

// Create the user store with the library
const userStore = createStore<UserState>('user', initialUserData)

// Default export the store instance
export default userStore
