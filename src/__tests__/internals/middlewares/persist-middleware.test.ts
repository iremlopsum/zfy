import { createJSONStorage } from 'zustand/middleware'

import { SyncStorage } from '../../index'
import persistMiddleware from '../../../internals/middlewares/persist-middleware'

import type { CreateStoreOptionsType } from '../../../types'

// Mock zustand's persist middleware
jest.mock('zustand/middleware', () => ({
  ...jest.requireActual('zustand/middleware'),
  persist: jest.fn((config) => config),
}))

const { persist } = require('zustand/middleware')

describe('💾 Internals > Middlewares > persist:', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls zustand persist middleware with config and options', () => {
    const storeName = 'test'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const options: CreateStoreOptionsType<any> = {
      persist: { storage },
    }

    persistMiddleware(storeName, config, options)

    expect(persist).toHaveBeenCalledWith(config, {
      name: storeName,
      storage,
    })
  })

  it('uses storeName as default name when not provided', () => {
    const storeName = 'myCustomStore'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const options: CreateStoreOptionsType<any> = {
      persist: { storage },
    }

    persistMiddleware(storeName, config, options)

    expect(persist).toHaveBeenCalledWith(config, {
      name: storeName,
      storage,
    })
  })

  it('uses custom name when provided in persist options', () => {
    const storeName = 'defaultName'
    const customName = 'customPersistName'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const options: CreateStoreOptionsType<any> = {
      persist: {
        name: customName,
        storage,
      },
    }

    persistMiddleware(storeName, config, options)

    expect(persist).toHaveBeenCalledWith(config, {
      name: customName,
      storage,
    })
  })

  it('passes through additional persist options', () => {
    const storeName = 'test'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const onRehydrateStorage = jest.fn()
    const partialize = jest.fn((state: any) => state.data)
    const options: CreateStoreOptionsType<any> = {
      persist: {
        storage,
        version: 2,
        onRehydrateStorage,
        partialize,
      },
    }

    persistMiddleware(storeName, config, options)

    expect(persist).toHaveBeenCalledWith(config, {
      name: storeName,
      storage,
      version: 2,
      onRehydrateStorage,
      partialize,
    })
  })

  it('handles undefined options', () => {
    const storeName = 'test'
    const config = jest.fn()

    persistMiddleware(storeName, config, undefined)

    expect(persist).toHaveBeenCalledWith(config, {
      name: storeName,
    })
  })

  it('handles empty persist options', () => {
    const storeName = 'test'
    const config = jest.fn()
    const options: CreateStoreOptionsType<any> = {
      persist: {} as any,
    }

    persistMiddleware(storeName, config, options)

    expect(persist).toHaveBeenCalledWith(config, {
      name: storeName,
    })
  })

  it('returns the result of zustand persist middleware', () => {
    const storeName = 'test'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const mockPersistedConfig = jest.fn()

    persist.mockReturnValueOnce(mockPersistedConfig)

    const options: CreateStoreOptionsType<any> = {
      persist: { storage },
    }

    const result = persistMiddleware(storeName, config, options)

    expect(result).toBe(mockPersistedConfig)
  })

  it('does not mutate original options object', () => {
    const storeName = 'test'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const originalOptions: CreateStoreOptionsType<any> = {
      persist: {
        storage,
        version: 1,
      },
    }

    const optionsCopy = {
      persist: { version: originalOptions.persist?.version },
    }

    persistMiddleware(storeName, config, originalOptions)

    // Verify the original options structure hasn't changed
    expect(originalOptions.persist?.version).toEqual(
      optionsCopy.persist.version
    )
  })

  it('handles persist options with only storage', () => {
    const storeName = 'test'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const options: CreateStoreOptionsType<any> = {
      persist: { storage },
    }

    persistMiddleware(storeName, config, options)

    expect(persist).toHaveBeenCalledWith(config, {
      name: storeName,
      storage,
    })
  })

  it('handles all common persist options', () => {
    const storeName = 'test'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const migrate = jest.fn()
    const merge = jest.fn()
    const onRehydrateStorage = jest.fn()
    const partialize = jest.fn()
    const skipHydration = false

    const options: CreateStoreOptionsType<any> = {
      persist: {
        storage,
        version: 3,
        migrate,
        merge,
        onRehydrateStorage,
        partialize,
        skipHydration,
      },
    }

    persistMiddleware(storeName, config, options)

    expect(persist).toHaveBeenCalledWith(config, {
      name: storeName,
      storage,
      version: 3,
      migrate,
      merge,
      onRehydrateStorage,
      partialize,
      skipHydration,
    })
  })

  it('properly destructures name from persist options', () => {
    const storeName = 'originalName'
    const customName = 'overriddenName'
    const config = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const options: CreateStoreOptionsType<any> = {
      persist: {
        name: customName,
        storage,
        version: 1,
      },
    }

    persistMiddleware(storeName, config, options)

    // name should be the custom name, not the storeName
    expect(persist).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        name: customName,
        storage,
        version: 1,
      })
    )

    // Ensure storeName is not in the persist options
    const persistCall = persist.mock.calls[0][1]
    expect(Object.keys(persistCall)).not.toContain('storeName')
  })
})
