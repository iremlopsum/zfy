import type { ZfyMiddlewareType } from '../types'
import { createJSONStorage } from 'zustand/middleware'

import { data, SyncStorage, rehydratedData, assertStoreContent } from '.'
import createStore from '../core/create-store'

type StoreDataType = typeof data

describe('🐣 Core > createStore():', () => {
  describe('validation', () => {
    it('throws error when store name is not provided', () => {
      // @ts-expect-error - testing invalid input
      expect(() => createStore()).toThrow(
        'You need to provide a unique store name string to createStore() as its first argument.'
      )
    })

    it('throws error when store name is undefined', () => {
      // @ts-expect-error - testing invalid input
      expect(() => createStore(undefined, data)).toThrow(
        'You need to provide a unique store name string to createStore() as its first argument.'
      )
    })

    it('throws error when initial data is not provided', () => {
      // @ts-expect-error - testing invalid input
      expect(() => createStore('jest')).toThrow(
        'You need to provide some initial data to your jest store via createStore() 2nd argument.'
      )
    })
  })

  it('creates store with minimal configuration', () => {
    const store = createStore('jest', data)
    assertStoreContent({ store, expectedData: data })
  })

  describe('logger middleware', () => {
    let consoleGroup: jest.SpyInstance
    let consoleDebug: jest.SpyInstance

    beforeEach(() => {
      consoleGroup = jest.spyOn(console, 'group').mockImplementation()
      consoleDebug = jest.spyOn(console, 'debug').mockImplementation()
    })

    afterEach(() => {
      consoleGroup.mockRestore()
      consoleDebug.mockRestore()
    })

    it('throws error when log option is not a boolean', () => {
      // @ts-expect-error - testing invalid input
      expect(() => createStore('jest', data, { log: 1 })).toThrow(
        "You need to provide a boolean to jest's createStore() options.log, 1 is not a boolean."
      )
    })

    it('logs state updates when enabled', () => {
      const store = createStore('jest', data, { log: true })
      assertStoreContent({ store, expectedData: data })

      store.getState().update((state) => {
        state.file = rehydratedData.file
      })

      expect(consoleGroup).toHaveBeenCalledWith(
        '%c🗂 JEST STORE UPDATED',
        'font-weight:bold'
      )
      expect(consoleDebug).toHaveBeenCalledWith(
        '%cprevState',
        'font-weight:bold; color: #9E9E9E',
        data
      )
      expect(consoleDebug).toHaveBeenCalledWith(
        '%cpayload',
        'font-weight:bold; color: #27A3F7',
        rehydratedData
      )
      expect(consoleDebug).toHaveBeenCalledWith(
        '%cnewState',
        'font-weight:bold; color: #C6E40A',
        rehydratedData
      )
    })
  })

  describe('subscribe middleware', () => {
    it('throws error when subscribe option is not a boolean', () => {
      // @ts-expect-error - testing invalid input
      expect(() => createStore('jest', data, { subscribe: 1 })).toThrow(
        "You need to provide a boolean to jest's createStore() options.subscribe, 1 is not a boolean."
      )
    })

    it('enables subscribeWithSelector when enabled', () => {
      const listener = jest.fn()
      const store = createStore<StoreDataType>('jest', data, {
        subscribe: true,
      })
      
      const unsubscribe = store.subscribeWithSelector?.(
        (state: any) => state.data.file,
        listener,
        { fireImmediately: true }
      )

      expect(unsubscribe).toBeInstanceOf(Function)
      expect(listener).toHaveBeenCalledWith(data.file, data.file)

      store.getState().update((state) => {
        state.file = rehydratedData.file
      })

      expect(listener).toHaveBeenCalledWith(rehydratedData.file, data.file)

      unsubscribe?.()
    })
  })

  describe('persist middleware', () => {
    it('throws error when persist option is not an object', () => {
      // @ts-expect-error - testing invalid input
      expect(() => createStore('jest', data, { persist: true })).toThrow(
        "You need to provide an object to jest's createStore() options.persist. true is not an object."
      )
    })

    it('throws error when storage is not provided', () => {
      // @ts-expect-error - testing invalid input
      expect(() => createStore('jest', data, { persist: {} })).toThrow(
        "You need to provide the storage to jest's createStore() options.persist."
      )
    })

    it('rehydrates data from storage when enabled', () => {
      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })
      
      assertStoreContent({ store, expectedData: rehydratedData })
    })
  })

  describe('middleware combination', () => {
    let consoleGroup: jest.SpyInstance
    let consoleDebug: jest.SpyInstance

    beforeEach(() => {
      consoleGroup = jest.spyOn(console, 'group').mockImplementation()
      consoleDebug = jest.spyOn(console, 'debug').mockImplementation()
    })

    afterEach(() => {
      consoleGroup.mockRestore()
      consoleDebug.mockRestore()
    })

    it('works with all built-in middlewares enabled', () => {
      const listener = jest.fn()
      const store = createStore<StoreDataType>('jest', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
        subscribe: true,
        log: true,
      })
      
      const unsubscribe = store.subscribeWithSelector?.(
        (state: any) => state.data.file,
        listener
      )

      expect(unsubscribe).toBeInstanceOf(Function)
      assertStoreContent({ store, expectedData: rehydratedData })

      store.getState().update((state) => {
        state.file = data.file
      })

      expect(listener).toHaveBeenCalledWith(data.file, rehydratedData.file)
      expect(consoleGroup).toHaveBeenCalledWith(
        '%c🗂 JEST STORE UPDATED',
        'font-weight:bold'
      )
      expect(consoleDebug).toHaveBeenCalledWith(
        '%cprevState',
        'font-weight:bold; color: #9E9E9E',
        rehydratedData
      )
      expect(consoleDebug).toHaveBeenCalledWith(
        '%cpayload',
        'font-weight:bold; color: #27A3F7',
        data
      )
      expect(consoleDebug).toHaveBeenCalledWith(
        '%cnewState',
        'font-weight:bold; color: #C6E40A',
        data
      )

      store.getState().update((state) => {
        state.file = rehydratedData.file
      })

      expect(listener).toHaveBeenCalledWith(rehydratedData.file, data.file)

      unsubscribe?.()
    })

    it('works with custom middlewares', () => {
      const fn = jest.fn()
      const customMiddleware: ZfyMiddlewareType<StoreDataType> =
        (storeName, config) => (set: any, get: any, api: any) =>
          config(
            (args: any) => {
              set(args)
              fn(storeName)
            },
            get,
            api
          )

      const store = createStore('jest', data, {
        log: true,
        persist: { storage: createJSONStorage(() => SyncStorage) },
        customMiddlewares: [customMiddleware],
      })

      assertStoreContent({ store, expectedData: rehydratedData })
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('jest')
    })
  })
})
