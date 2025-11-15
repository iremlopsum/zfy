import { createJSONStorage } from 'zustand/middleware'
import { act, renderHook } from '@testing-library/react'

import { initStores, createStore } from '../core'
import { SyncStorage, rehydratedData } from './index'

const dataA = { fileA: 'create-store.test.ts' }
const rehydratedDataA = { fileA: 'rehydrated' }

const dataB = { fileB: 'create-store.test.ts' }
const rehydratedDataB = { fileB: 'rehydrated' }

type StoresDataType = {
  jestA: typeof dataA
  jestB: typeof dataB
}

describe('🚀 Core > initStores():', () => {
  describe('validation', () => {
    it('throws error when stores array is not provided', () => {
      // @ts-expect-error - testing invalid input
      expect(() => initStores()).toThrow(
        'You must provide an array of your zustand stores to useRehydrate().'
      )
    })

    it('throws error for invalid store name in useStores', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB)

      const { useStores } = initStores<StoresDataType>([storeA, storeB])

      expect(() => {
        // @ts-expect-error - testing invalid input
        renderHook(useStores('random', (data) => data.fileA))
      }).toThrow(
        `'random' is not a valid store name. Did you mean any of these: \n• jestA,\n• jestB`
      )
    })
  })

  describe('rehydration', () => {
    it('rehydrates multiple stores from storage', async () => {
      const onRehydrationDone = jest.fn()
      const onRehydrateStorageSpy = jest.fn(() => onRehydrationDone)

      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA, {
        persist: {
          storage: createJSONStorage(() => SyncStorage),
          onRehydrateStorage: onRehydrateStorageSpy,
        },
      })
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB, {
        persist: {
          storage: createJSONStorage(() => SyncStorage),
        },
      })

      expect(onRehydrateStorageSpy).toHaveBeenCalled()

      const { stores } = initStores<StoresDataType>([storeA, storeB])
      const status = await stores.rehydrate()

      expect(status).toBeTruthy()
      expect(onRehydrationDone).toHaveBeenCalledWith(
        stores.jestA.getState(),
        undefined
      )
      expect(stores.jestA.getState().data).toEqual(rehydratedData)
      expect(stores.jestB.getState().data).toEqual(rehydratedData)
    })
  })

  describe('reset functionality', () => {
    it('resets all stores to initial state', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB)

      const { stores } = initStores<StoresDataType>([storeA, storeB])

      // Verify initial state
      expect(stores.jestA.getState().data).toEqual(dataA)
      expect(stores.jestB.getState().data).toEqual(dataB)

      // Update stores
      stores.jestA.getState().update((data) => {
        data.fileA = rehydratedDataA.fileA
      })
      stores.jestB.getState().update((data) => {
        data.fileB = rehydratedDataB.fileB
      })

      expect(stores.jestA.getState().data).toEqual(rehydratedDataA)
      expect(stores.jestB.getState().data).toEqual(rehydratedDataB)

      // Reset all stores
      stores.reset()

      expect(stores.jestA.getState().data).toEqual(dataA)
      expect(stores.jestB.getState().data).toEqual(dataB)
    })

    it('resets stores selectively with omit option', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB)

      const { stores } = initStores<StoresDataType>([storeA, storeB])

      // Update both stores
      stores.jestA.getState().update((data) => {
        data.fileA = rehydratedDataA.fileA
      })
      stores.jestB.getState().update((data) => {
        data.fileB = rehydratedDataB.fileB
      })

      // Reset only storeA (omit storeB)
      stores.reset({ omit: ['jestB'] })

      expect(stores.jestA.getState().data).toEqual(dataA)
      expect(stores.jestB.getState().data).toEqual(rehydratedDataB)
    })
  })

  describe('API', () => {
    it('provides stores object with helper methods', () => {
      const store = createStore<StoresDataType['jestA']>('jestA', dataA)

      const { stores } = initStores<StoresDataType>([store])

      expect(stores.jestA.getState().data).toEqual(dataA)
      expect(stores.rehydrate).toBeInstanceOf(Function)
      expect(stores.reset).toBeInstanceOf(Function)
    })

    it('provides useStores hook for React components', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB)

      const { stores, useStores } = initStores<StoresDataType>([storeA, storeB])

      const { result } = renderHook(() =>
        useStores(
          'jestA',
          (data) => data.fileA,
          (prevData: any, newData: any) => prevData === newData
        )
      )

      expect(result.current).toBe(dataA.fileA)

      act(() => {
        stores.jestA.getState().update((data) => {
          data.fileA = rehydratedDataA.fileA
        })
      })

      expect(result.current).toBe(rehydratedDataA.fileA)

      act(stores.reset)

      expect(result.current).toBe(dataA.fileA)
    })
  })

  describe('concurrent operations', () => {
    it('handles simultaneous updates to multiple stores', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB)

      const { stores } = initStores<StoresDataType>([storeA, storeB])

      // Perform simultaneous updates
      act(() => {
        stores.jestA.getState().update((data) => {
          data.fileA = 'concurrent-A'
        })
        stores.jestB.getState().update((data) => {
          data.fileB = 'concurrent-B'
        })
      })

      expect(stores.jestA.getState().data.fileA).toBe('concurrent-A')
      expect(stores.jestB.getState().data.fileB).toBe('concurrent-B')
    })

    it('handles concurrent rehydration calls', async () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { stores } = initStores<StoresDataType>([storeA, storeB])

      // Call rehydrate multiple times concurrently
      const [result1, result2, result3] = await Promise.all([
        stores.rehydrate(),
        stores.rehydrate(),
        stores.rehydrate(),
      ])

      expect(result1).toBeTruthy()
      expect(result2).toBeTruthy()
      expect(result3).toBeTruthy()
      expect(stores.jestA.getState().data).toEqual(rehydratedData)
      expect(stores.jestB.getState().data).toEqual(rehydratedData)
    })

    it('handles concurrent reset calls', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB)

      const { stores } = initStores<StoresDataType>([storeA, storeB])

      // Update stores
      stores.jestA.getState().update((data) => {
        data.fileA = 'modified-A'
      })
      stores.jestB.getState().update((data) => {
        data.fileB = 'modified-B'
      })

      // Call reset multiple times
      act(() => {
        stores.reset()
        stores.reset()
        stores.reset()
      })

      expect(stores.jestA.getState().data).toEqual(dataA)
      expect(stores.jestB.getState().data).toEqual(dataB)
    })

    it('handles rapid sequential updates to same store', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const { stores } = initStores<StoresDataType>([storeA])

      // Perform rapid updates
      act(() => {
        for (let i = 0; i < 100; i++) {
          stores.jestA.getState().update((data) => {
            data.fileA = `update-${i}`
          })
        }
      })

      expect(stores.jestA.getState().data.fileA).toBe('update-99')
    })

    it('handles interleaved updates and resets', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB)

      const { stores } = initStores<StoresDataType>([storeA, storeB])

      act(() => {
        stores.jestA.getState().update((data) => {
          data.fileA = 'step-1'
        })
        stores.jestB.getState().update((data) => {
          data.fileB = 'step-1'
        })
        stores.reset({ omit: ['jestB'] })
        stores.jestA.getState().update((data) => {
          data.fileA = 'step-2'
        })
      })

      expect(stores.jestA.getState().data.fileA).toBe('step-2')
      expect(stores.jestB.getState().data.fileB).toBe('step-1')
    })

    it('handles concurrent updates from multiple React hooks', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const { stores, useStores } = initStores<StoresDataType>([storeA])

      const { result: result1 } = renderHook(() =>
        useStores('jestA', (data) => data.fileA)
      )
      const { result: result2 } = renderHook(() =>
        useStores('jestA', (data) => data.fileA)
      )

      expect(result1.current).toBe(dataA.fileA)
      expect(result2.current).toBe(dataA.fileA)

      act(() => {
        stores.jestA.getState().update((data) => {
          data.fileA = 'concurrent-hook-update'
        })
      })

      expect(result1.current).toBe('concurrent-hook-update')
      expect(result2.current).toBe('concurrent-hook-update')
    })

    it('maintains store consistency during rapid state changes', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const storeB = createStore<StoresDataType['jestB']>('jestB', dataB)

      const { stores } = initStores<StoresDataType>([storeA, storeB])

      // Perform many rapid operations
      act(() => {
        for (let i = 0; i < 50; i++) {
          stores.jestA.getState().update((data) => {
            data.fileA = `A-${i}`
          })
          stores.jestB.getState().update((data) => {
            data.fileB = `B-${i}`
          })

          // Reset happens every 10 iterations
          if (i % 10 === 0 && i > 0) {
            stores.reset({ omit: ['jestB'] })
          }
        }
      })

      // After the loop, storeA should be at initial state from last reset at i=40
      // Then updated at i=41-49, so it should have the last value before final reset
      // Actually, the logic resets at i=10,20,30,40 and updates continue after
      // Final value should be from updates after last reset
      expect(stores.jestA.getState().data.fileA).toBe('A-49')
      expect(stores.jestB.getState().data.fileB).toBe('B-49')
    })

    it('handles race condition between reset and update', () => {
      const storeA = createStore<StoresDataType['jestA']>('jestA', dataA)
      const { stores } = initStores<StoresDataType>([storeA])

      // Update before reset
      stores.jestA.getState().update((data) => {
        data.fileA = 'before-reset'
      })

      act(() => {
        // These happen in quick succession
        stores.reset()
        stores.jestA.getState().update((data) => {
          data.fileA = 'after-reset'
        })
      })

      expect(stores.jestA.getState().data.fileA).toBe('after-reset')
    })
  })
})
