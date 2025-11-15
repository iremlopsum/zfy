import { createStore } from '../../../src/index'

interface StoresDataType {
  user: {
    likes: number
  }
}

export const initialState: StoresDataType['user'] = {
  likes: 0,
}

export default createStore<StoresDataType['user']>('user', initialState, {
  log: true,
})
