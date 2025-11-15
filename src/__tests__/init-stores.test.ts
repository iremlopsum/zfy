import { act, renderHook } from '@testing-library/react'
import { createJSONStorage } from 'zustand/middleware'

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

      const { stores, useStores } = initStores<StoresDataType>([
        storeA,
        storeB,
      ])

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
})
