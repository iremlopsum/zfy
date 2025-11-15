import { createJSONStorage } from 'zustand/middleware'
import { renderHook, waitFor } from '@testing-library/react'

import createStore from '../core/create-store'
import useRehydrate from '../core/use-rehydrate'
import { AsyncStorage, SyncStorage, data, rehydratedData } from '.'

describe('💧 Core > useRehydrate():', () => {
  /**
   * NOTE: The zustand layer is already tested.
   * @see https://github.com/pmndrs/zustand/blob/main/tests/persistSync.test.tsx
   */
  it('rehydrates with sync storage', async () => {
    const store = createStore('jest', data, {
      persist: { storage: createJSONStorage(() => SyncStorage) },
    })

    const { result } = renderHook(() => useRehydrate([store]))

    expect(result.current.valueOf()).toBeFalsy()

    await waitFor(() => {
      expect(result.current.valueOf()).toBeTruthy()
    })

    expect(store.getState().data).toEqual(rehydratedData)
  })

  /**
   * NOTE: The zustand layer is already tested.
   * @see https://github.com/pmndrs/zustand/blob/main/tests/persistAsync.test.tsx
   */
  it('rehydrates with async storage', async () => {
    const store = createStore('jest', data, {
      persist: { storage: createJSONStorage(() => AsyncStorage) },
    })

    const { result } = renderHook(() => useRehydrate([store]))

    expect(result.current.valueOf()).toBeFalsy()

    await waitFor(() => {
      expect(result.current.valueOf()).toBeTruthy()
    })

    expect(store.getState().data).toEqual(rehydratedData)
  })
})
