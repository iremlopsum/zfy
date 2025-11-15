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

    describe('storage failure scenarios', () => {
      let consoleError: jest.SpyInstance

      beforeEach(() => {
        consoleError = jest.spyOn(console, 'error').mockImplementation()
      })

      afterEach(() => {
        consoleError.mockRestore()
      })

      it('handles storage getItem throwing error', () => {
        const FailingStorage = {
          getItem: () => {
            throw new Error('Storage read failed')
          },
          setItem: SyncStorage.setItem,
          removeItem: SyncStorage.removeItem,
        }

        // Store should still be created with initial data
        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => FailingStorage) },
        })

        // Falls back to initial data when storage fails
        assertStoreContent({ store, expectedData: data })
      })

      it('handles storage setItem throwing error', () => {
        const FailingStorage = {
          getItem: SyncStorage.getItem,
          setItem: () => {
            throw new Error('Storage write failed')
          },
          removeItem: SyncStorage.removeItem,
        }

        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => FailingStorage) },
        })

        // Store should rehydrate successfully
        assertStoreContent({ store, expectedData: rehydratedData })

        // Update throws because persist middleware can't write, but state is updated
        // Note: Zustand's persist doesn't catch storage write errors by design
        expect(() => {
          store.getState().update((state) => {
            state.file = data.file
          })
        }).toThrow('Storage write failed')

        // State should still be updated in memory before the throw
        expect(store.getState().data.file).toBe(data.file)
      })

      it('handles quota exceeded error', () => {
        const QuotaExceededStorage = {
          getItem: SyncStorage.getItem,
          setItem: () => {
            const error: any = new Error('QuotaExceededError')
            error.name = 'QuotaExceededError'
            throw error
          },
          removeItem: SyncStorage.removeItem,
        }

        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => QuotaExceededStorage) },
        })

        // Throws quota exceeded error
        expect(() => {
          store.getState().update((state) => {
            state.file = 'new-file'
          })
        }).toThrow('QuotaExceededError')

        // State is still updated in memory
        expect(store.getState().data.file).toBe('new-file')
      })

      it('handles malformed JSON data in storage', () => {
        const MalformedStorage = {
          getItem: () => 'invalid-json{{{',
          setItem: SyncStorage.setItem,
          removeItem: SyncStorage.removeItem,
        }

        // Should fall back to initial data
        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => MalformedStorage) },
        })

        assertStoreContent({ store, expectedData: data })
      })

      it('handles null storage returns', () => {
        const NullStorage = {
          getItem: () => null,
          setItem: SyncStorage.setItem,
          removeItem: SyncStorage.removeItem,
        }

        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => NullStorage) },
        })

        assertStoreContent({ store, expectedData: data })
      })

      it('handles undefined storage returns', () => {
        const UndefinedStorage = {
          getItem: () => undefined as any,
          setItem: SyncStorage.setItem,
          removeItem: SyncStorage.removeItem,
        }

        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => UndefinedStorage) },
        })

        assertStoreContent({ store, expectedData: data })
      })

      it('handles storage with corrupted version data', () => {
        const CorruptedStorage = {
          getItem: () =>
            JSON.stringify({
              state: { name: 'jest', data: rehydratedData },
              version: 'not-a-number',
            }),
          setItem: SyncStorage.setItem,
          removeItem: SyncStorage.removeItem,
        }

        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => CorruptedStorage) },
        })

        // Should still work, zustand handles version mismatches
        expect(store.getState()).toBeDefined()
      })

      it('handles storage with missing state property', () => {
        const MissingStateStorage = {
          getItem: () => JSON.stringify({ version: 0 }),
          setItem: SyncStorage.setItem,
          removeItem: SyncStorage.removeItem,
        }

        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => MissingStateStorage) },
        })

        assertStoreContent({ store, expectedData: data })
      })

      it('handles removeItem throwing error', () => {
        const FailingRemoveStorage = {
          getItem: SyncStorage.getItem,
          setItem: SyncStorage.setItem,
          removeItem: () => {
            throw new Error('Remove failed')
          },
        }

        const store = createStore('jest', data, {
          persist: { storage: createJSONStorage(() => FailingRemoveStorage) },
        })

        assertStoreContent({ store, expectedData: rehydratedData })

        // Reset should work even if persist cleanup fails
        expect(() => {
          store.getState().reset()
        }).not.toThrow()

        // State should be reset in memory
        assertStoreContent({ store, expectedData: data })
      })
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
      // Clear previous storage to avoid conflicts
      SyncStorage.removeItem('jestCombo')

      const listener = jest.fn()
      const store = createStore<StoreDataType>('jestCombo', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
        subscribe: true,
        log: true,
      })

      const unsubscribe = store.subscribeWithSelector?.(
        (state: any) => state.data.file,
        listener
      )

      expect(unsubscribe).toBeInstanceOf(Function)
      // Store won't have rehydrated data since we cleared storage
      assertStoreContent({
        store,
        expectedData: data,
        expectedName: 'jestCombo',
      })

      store.getState().update((state) => {
        state.file = rehydratedData.file
      })

      expect(listener).toHaveBeenCalledWith(rehydratedData.file, data.file)
      expect(consoleGroup).toHaveBeenCalledWith(
        '%c🗂 JESTCOMBO STORE UPDATED',
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

      store.getState().update((state) => {
        state.file = data.file
      })

      expect(listener).toHaveBeenCalledWith(data.file, rehydratedData.file)

      unsubscribe?.()
    })

    it('works with custom middlewares', () => {
      // Clear previous storage to avoid conflicts
      SyncStorage.removeItem('jestCustom')

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

      const store = createStore('jestCustom', data, {
        log: true,
        persist: { storage: createJSONStorage(() => SyncStorage) },
        customMiddlewares: [customMiddleware],
      })

      // Store won't have rehydrated data since we cleared storage
      assertStoreContent({
        store,
        expectedData: data,
        expectedName: 'jestCustom',
      })
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('jestCustom')
    })
  })
})
