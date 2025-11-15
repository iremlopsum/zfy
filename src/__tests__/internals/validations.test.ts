import { create } from 'zustand'
import { createJSONStorage } from 'zustand/middleware'

import { SyncStorage } from '../index'
import { InvariantError } from '../../internals/invariant'
import {
  validateInitStores,
  validatePersistGate,
  validateCreateStore,
  validateUseRehydrate,
  validateOptionsForPersistence,
} from '../../internals/validations'

import type { CreateStoreType, CreateStoreOptionsType } from '../../types'

// Helper to create a minimal store for testing
const createMockStore = (name: string): CreateStoreType<any> => {
  return create(() => ({
    name,
    data: {},
    update: jest.fn(),
    reset: jest.fn(),
  })) as CreateStoreType<any>
}

describe('🔍 Internals > validations:', () => {
  describe('validateInitStores', () => {
    it('throws when stores is not provided', () => {
      // @ts-expect-error - testing invalid input
      expect(() => validateInitStores()).toThrow(InvariantError)
      // @ts-expect-error - testing invalid input
      expect(() => validateInitStores()).toThrow(
        'You must provide an array of your zustand stores to useRehydrate().'
      )
    })

    it('throws when stores is not an array', () => {
      // @ts-expect-error - testing invalid input
      expect(() => validateInitStores({})).toThrow(InvariantError)
      // @ts-expect-error - testing invalid input
      expect(() => validateInitStores(null)).toThrow(InvariantError)
      // @ts-expect-error - testing invalid input
      expect(() => validateInitStores('store')).toThrow(InvariantError)
    })

    it('throws when stores is an empty array', () => {
      expect(() => validateInitStores([])).toThrow(InvariantError)
      expect(() => validateInitStores([])).toThrow(
        'You must provide an array of your zustand stores to useRehydrate().'
      )
    })

    it('does not throw with valid stores array', () => {
      const store = createMockStore('test')
      expect(() => validateInitStores([store])).not.toThrow()
      expect(() =>
        validateInitStores([store, createMockStore('test2')])
      ).not.toThrow()
    })
  })

  describe('validatePersistGate', () => {
    it('throws when stores is not provided', () => {
      // @ts-expect-error - testing invalid input
      expect(() => validatePersistGate()).toThrow(InvariantError)
      // @ts-expect-error - testing invalid input
      expect(() => validatePersistGate()).toThrow(
        "You must provide an array of your zustand stores to <PersisGate /> 'stores' prop."
      )
    })

    it('throws when stores is not an array', () => {
      // @ts-expect-error - testing invalid input
      expect(() => validatePersistGate({})).toThrow(InvariantError)
      // @ts-expect-error - testing invalid input
      expect(() => validatePersistGate(null)).toThrow(InvariantError)
    })

    it('throws when stores is an empty array', () => {
      expect(() => validatePersistGate([])).toThrow(InvariantError)
      expect(() => validatePersistGate([])).toThrow(
        "You must provide an array of your zustand stores to <PersisGate /> 'stores' prop."
      )
    })

    it('does not throw with valid stores array', () => {
      const store = createMockStore('test')
      expect(() => validatePersistGate([store])).not.toThrow()
    })
  })

  describe('validateUseRehydrate', () => {
    it('throws when stores is not provided', () => {
      // @ts-expect-error - testing invalid input
      expect(() => validateUseRehydrate()).toThrow(InvariantError)
      // @ts-expect-error - testing invalid input
      expect(() => validateUseRehydrate()).toThrow(
        'You must provide an array of your zustand stores to useRehydrate().'
      )
    })

    it('throws when stores is not an array', () => {
      // @ts-expect-error - testing invalid input
      expect(() => validateUseRehydrate({})).toThrow(InvariantError)
      // @ts-expect-error - testing invalid input
      expect(() => validateUseRehydrate(null)).toThrow(InvariantError)
    })

    it('throws when stores is an empty array', () => {
      expect(() => validateUseRehydrate([])).toThrow(InvariantError)
    })

    it('does not throw with valid stores array', () => {
      const store = createMockStore('test')
      expect(() => validateUseRehydrate([store])).not.toThrow()
    })
  })

  describe('validateCreateStore', () => {
    const validData = { test: 'data' }

    it('throws when storeName is not provided', () => {
      // @ts-expect-error - testing invalid input
      expect(() => validateCreateStore({ data: validData })).toThrow(
        InvariantError
      )
      // @ts-expect-error - testing invalid input
      expect(() => validateCreateStore({ data: validData })).toThrow(
        'You need to provide a unique store name string to createStore() as its first argument.'
      )
    })

    it('throws when storeName is not a string', () => {
      expect(() =>
        // @ts-expect-error - testing invalid input
        validateCreateStore({ storeName: 123, data: validData })
      ).toThrow(InvariantError)
      expect(() =>
        // @ts-expect-error - testing invalid input
        validateCreateStore({ storeName: {}, data: validData })
      ).toThrow(
        'You need to provide a unique store name string to createStore() as its first argument.'
      )
    })

    it('throws when storeName is empty string', () => {
      expect(() =>
        validateCreateStore({ storeName: '', data: validData })
      ).toThrow(InvariantError)
      expect(() =>
        validateCreateStore({ storeName: '', data: validData })
      ).toThrow(
        'You need to provide a unique store name string to createStore() as its first argument.'
      )
    })

    it('throws when data is not provided', () => {
      expect(() =>
        // @ts-expect-error - testing invalid input
        validateCreateStore({ storeName: 'test' })
      ).toThrow(InvariantError)
      expect(() =>
        // @ts-expect-error - testing invalid input
        validateCreateStore({ storeName: 'test' })
      ).toThrow(
        'You need to provide some initial data to your test store via createStore() 2nd argument.'
      )
    })

    it('throws when data is null', () => {
      expect(() =>
        validateCreateStore({ storeName: 'test', data: null as any })
      ).toThrow(InvariantError)
      expect(() =>
        validateCreateStore({ storeName: 'test', data: null as any })
      ).toThrow(
        'You need to provide some initial data to your test store via createStore() 2nd argument.'
      )
    })

    it('throws when data is undefined', () => {
      expect(() =>
        validateCreateStore({ storeName: 'test', data: undefined })
      ).toThrow(InvariantError)
    })

    it('does not throw with valid storeName and data', () => {
      expect(() =>
        validateCreateStore({ storeName: 'test', data: validData })
      ).not.toThrow()
      expect(() =>
        validateCreateStore({ storeName: 'test', data: {} })
      ).not.toThrow()
      expect(() =>
        validateCreateStore({ storeName: 'test', data: [] })
      ).not.toThrow()
      expect(() =>
        validateCreateStore({ storeName: 'test', data: 0 })
      ).not.toThrow()
      expect(() =>
        validateCreateStore({ storeName: 'test', data: false })
      ).not.toThrow()
    })

    it('throws when options.log is not a boolean', () => {
      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options: { log: 'true' as any },
        })
      ).toThrow(InvariantError)
      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options: { log: 1 as any },
        })
      ).toThrow(
        "You need to provide a boolean to test's createStore() options.log, 1 is not a boolean."
      )
    })

    it('does not throw with valid options.log', () => {
      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options: { log: true },
        })
      ).not.toThrow()
      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options: { log: false },
        })
      ).not.toThrow()
    })

    it('throws when options.subscribe is not a boolean', () => {
      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options: { subscribe: 'true' as any },
        })
      ).toThrow(InvariantError)
      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options: { subscribe: 1 as any },
        })
      ).toThrow(
        "You need to provide a boolean to test's createStore() options.subscribe, 1 is not a boolean."
      )
    })

    it('does not throw with valid options.subscribe', () => {
      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options: { subscribe: true },
        })
      ).not.toThrow()
      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options: { subscribe: false },
        })
      ).not.toThrow()
    })

    it('calls validateOptionsForPersistence when persist option is provided', () => {
      const options: CreateStoreOptionsType<any> = {
        persist: {
          storage: createJSONStorage(() => SyncStorage),
        },
      }

      expect(() =>
        validateCreateStore({
          storeName: 'test',
          data: validData,
          options,
        })
      ).not.toThrow()
    })
  })

  describe('validateOptionsForPersistence', () => {
    const storeName = 'test'

    it('throws when options.persist is not an object', () => {
      expect(() =>
        validateOptionsForPersistence(storeName, {
          // @ts-expect-error - testing invalid input
          persist: true,
        })
      ).toThrow(InvariantError)
      expect(() =>
        validateOptionsForPersistence(storeName, {
          // @ts-expect-error - testing invalid input
          persist: true,
        })
      ).toThrow(
        "You need to provide an object to test's createStore() options.persist. true is not an object."
      )
    })

    it('throws when options.persist is a string', () => {
      expect(() =>
        validateOptionsForPersistence(storeName, {
          // @ts-expect-error - testing invalid input
          persist: 'storage',
        })
      ).toThrow(InvariantError)
    })

    it('throws when options.persist is an array', () => {
      expect(() =>
        validateOptionsForPersistence(storeName, {
          // @ts-expect-error - testing invalid input
          persist: [],
        })
      ).toThrow(InvariantError)
      expect(() =>
        validateOptionsForPersistence(storeName, {
          // @ts-expect-error - testing invalid input
          persist: [],
        })
      ).toThrow(
        "You need to provide an object to test's createStore() options.persist"
      )
    })

    it('throws when storage is not provided', () => {
      expect(() =>
        validateOptionsForPersistence(storeName, {
          persist: {} as any,
        })
      ).toThrow(InvariantError)
      expect(() =>
        validateOptionsForPersistence(storeName, {
          persist: {} as any,
        })
      ).toThrow(
        "You need to provide the storage to test's createStore() options.persist."
      )
    })

    it('does not throw with valid persist options', () => {
      expect(() =>
        validateOptionsForPersistence(storeName, {
          persist: {
            storage: createJSONStorage(() => SyncStorage) as any,
          },
        })
      ).not.toThrow()
    })

    it('does not throw when persist option has additional valid properties', () => {
      expect(() =>
        validateOptionsForPersistence(storeName, {
          persist: {
            storage: createJSONStorage(() => SyncStorage) as any,
            name: 'custom-name',
            version: 1,
          },
        })
      ).not.toThrow()
    })
  })
})
