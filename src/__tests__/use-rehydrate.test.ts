import { createJSONStorage } from 'zustand/middleware'
import { renderHook, waitFor } from '@testing-library/react'

import createStore from '../core/create-store'
import useRehydrate from '../core/use-rehydrate'
import { AsyncStorage, SyncStorage, data, rehydratedData } from '.'

describe('💧 Core > useRehydrate():', () => {
  describe('basic functionality', () => {
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

  describe('multiple stores', () => {
    it('waits for all stores to rehydrate', async () => {
      const storeA = createStore('jestA', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })
      const storeB = createStore('jestB', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { result } = renderHook(() => useRehydrate([storeA, storeB]))

      expect(result.current.valueOf()).toBeFalsy()

      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      expect(storeA.getState().data).toEqual(rehydratedData)
      expect(storeB.getState().data).toEqual(rehydratedData)
    })

    it('waits for all async stores to rehydrate', async () => {
      const storeA = createStore('jestA', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })
      const storeB = createStore('jestB', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })

      const { result } = renderHook(() => useRehydrate([storeA, storeB]))

      expect(result.current.valueOf()).toBeFalsy()

      await waitFor(
        () => {
          expect(result.current.valueOf()).toBeTruthy()
        },
        { timeout: 600 }
      )

      expect(storeA.getState().data).toEqual(rehydratedData)
      expect(storeB.getState().data).toEqual(rehydratedData)
    })

    it('handles mixed sync and async stores', async () => {
      const syncStore = createStore('jestA', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })
      const asyncStore = createStore('jestB', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })

      const { result } = renderHook(() => useRehydrate([syncStore, asyncStore]))

      expect(result.current.valueOf()).toBeFalsy()

      await waitFor(
        () => {
          expect(result.current.valueOf()).toBeTruthy()
        },
        { timeout: 600 }
      )

      expect(syncStore.getState().data).toEqual(rehydratedData)
      expect(asyncStore.getState().data).toEqual(rehydratedData)
    })
  })

  describe('stores without persist', () => {
    it('waits for store without persist middleware', async () => {
      const storeWithoutPersist = createStore('jest', data)

      const { result } = renderHook(() => useRehydrate([storeWithoutPersist]))

      // Initially false, becomes true after effect runs
      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      expect(storeWithoutPersist.getState().data).toEqual(data)
    })

    it('waits only for stores with persist', async () => {
      const persistStore = createStore('jestA', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })
      const nonPersistStore = createStore('jestB', data)

      const { result } = renderHook(() =>
        useRehydrate([persistStore, nonPersistStore])
      )

      expect(result.current.valueOf()).toBeFalsy()

      await waitFor(
        () => {
          expect(result.current.valueOf()).toBeTruthy()
        },
        { timeout: 600 }
      )

      expect(persistStore.getState().data).toEqual(rehydratedData)
      expect(nonPersistStore.getState().data).toEqual(data)
    })

    it('becomes true after checking all stores without persist', async () => {
      const storeA = createStore('jestA', data)
      const storeB = createStore('jestB', data)

      const { result } = renderHook(() => useRehydrate([storeA, storeB]))

      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      expect(storeA.getState().data).toEqual(data)
      expect(storeB.getState().data).toEqual(data)
    })
  })

  describe('validation', () => {
    it('throws error when stores is not provided', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        // @ts-expect-error - testing invalid input
        renderHook(() => useRehydrate())
      }).toThrow()

      consoleError.mockRestore()
    })

    it('throws error when stores is empty array', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        renderHook(() => useRehydrate([]))
      }).toThrow(
        'You must provide an array of your zustand stores to useRehydrate().'
      )

      consoleError.mockRestore()
    })

    it('throws error when stores is not an array', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        // @ts-expect-error - testing invalid input
        renderHook(() => useRehydrate('not-an-array'))
      }).toThrow()

      consoleError.mockRestore()
    })
  })

  describe('edge cases', () => {
    it('handles store with skipHydration option', async () => {
      const store = createStore('jest', data, {
        persist: {
          storage: createJSONStorage(() => SyncStorage),
          skipHydration: true,
        },
      })

      const { result } = renderHook(() => useRehydrate([store]))

      // Hook still checks rehydration state even with skipHydration
      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      // Manual rehydration if needed
      await store.persist?.rehydrate()

      expect(store.getState().data).toEqual(rehydratedData)
    })

    it('handles storage read failure gracefully', async () => {
      const FailingStorage = {
        getItem: () => {
          throw new Error('Storage read failed')
        },
        setItem: SyncStorage.setItem,
        removeItem: SyncStorage.removeItem,
      }

      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => FailingStorage) },
      })

      const { result } = renderHook(() => useRehydrate([store]))

      // Should eventually resolve even if storage fails
      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      // Falls back to initial data
      expect(store.getState().data).toEqual(data)

      consoleError.mockRestore()
    })

    it('updates when store is rehydrated after hook mount', async () => {
      const store = createStore('jest', data, {
        persist: {
          storage: createJSONStorage(() => AsyncStorage),
          skipHydration: true,
        },
      })

      const { result } = renderHook(() => useRehydrate([store]))

      // Hook still checks state even with skipHydration
      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      // Manually trigger rehydration
      await store.persist?.rehydrate()

      await waitFor(
        () => {
          expect(store.getState().data).toEqual(rehydratedData)
        },
        { timeout: 600 }
      )
    })

    it('handles empty persisted state', async () => {
      const EmptyStorage = {
        getItem: () => null,
        setItem: SyncStorage.setItem,
        removeItem: SyncStorage.removeItem,
      }

      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => EmptyStorage) },
      })

      const { result } = renderHook(() => useRehydrate([store]))

      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      // Should use initial data when storage is empty
      expect(store.getState().data).toEqual(data)
    })
  })

  describe('re-subscription behavior', () => {
    it('properly cleans up subscriptions on unmount', async () => {
      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { result, unmount } = renderHook(() => useRehydrate([store]))

      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      // Should not throw on unmount
      expect(() => {
        unmount()
      }).not.toThrow()
    })

    it('handles store list changes', async () => {
      const storeA = createStore('jestA', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })
      const storeB = createStore('jestB', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { result, rerender } = renderHook(
        ({ stores }) => useRehydrate(stores),
        { initialProps: { stores: [storeA] } }
      )

      await waitFor(() => {
        expect(result.current.valueOf()).toBeTruthy()
      })

      // Change stores
      rerender({ stores: [storeB] })

      expect(result.current.valueOf()).toBeTruthy()
      expect(storeB.getState().data).toEqual(rehydratedData)
    })
  })
})
