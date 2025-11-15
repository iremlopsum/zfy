import { createJSONStorage } from 'zustand/middleware'

import { SyncStorage } from '../../index'
import createMiddlewares from '../../../internals/middlewares/create-middlewares'

import type { ZfyMiddlewareType, CreateStoreOptionsType } from '../../../types'

// Mock the individual middleware modules
jest.mock('../../../internals/middlewares/logger-middleware', () => ({
  __esModule: true,
  default: jest.fn(<T>(_storeName: string, config: T) => config),
}))

jest.mock('../../../internals/middlewares/persist-middleware', () => ({
  __esModule: true,
  default: jest.fn(<T>(_storeName: string, config: T) => config),
}))

jest.mock('../../../internals/middlewares/subscribe-middleware', () => ({
  __esModule: true,
  default: jest.fn(<T>(_storeName: string, config: T) => config),
}))

jest.mock('../../../internals/validations', () => ({
  ...jest.requireActual('../../../internals/validations'),
  validateOptionsForPersistence: jest.fn(),
}))

const logger =
  require('../../../internals/middlewares/logger-middleware').default
const persist =
  require('../../../internals/middlewares/persist-middleware').default
const subscribe =
  require('../../../internals/middlewares/subscribe-middleware').default
const {
  validateOptionsForPersistence,
} = require('../../../internals/validations')

describe('🔧 Internals > Middlewares > create-middlewares:', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a function', () => {
    const storeName = 'test'
    const result = createMiddlewares(storeName)

    expect(typeof result).toBe('function')
  })

  it('returns original config when no middlewares are enabled', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const applyMiddlewares = createMiddlewares(storeName)

    const result = applyMiddlewares(storeName, mockConfig)

    expect(result).toBe(mockConfig)
    expect(logger).not.toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('applies logger middleware when log option is true', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const options: CreateStoreOptionsType<any> = { log: true }
    const applyMiddlewares = createMiddlewares(storeName, options)

    applyMiddlewares(storeName, mockConfig)

    expect(logger).toHaveBeenCalledWith(storeName, mockConfig, options)
    expect(persist).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('does not apply logger middleware when log option is false', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const options: CreateStoreOptionsType<any> = { log: false }
    const applyMiddlewares = createMiddlewares(storeName, options)

    applyMiddlewares(storeName, mockConfig)

    expect(logger).not.toHaveBeenCalled()
  })

  it('applies subscribe middleware when subscribe option is true', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const options: CreateStoreOptionsType<any> = { subscribe: true }
    const applyMiddlewares = createMiddlewares(storeName, options)

    applyMiddlewares(storeName, mockConfig)

    expect(subscribe).toHaveBeenCalledWith(storeName, mockConfig, options)
    expect(logger).not.toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
  })

  it('applies persist middleware when persist option is provided', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const options: CreateStoreOptionsType<any> = {
      persist: { storage } as any,
    }
    const applyMiddlewares = createMiddlewares(storeName, options)

    applyMiddlewares(storeName, mockConfig)

    expect(persist).toHaveBeenCalledWith(storeName, mockConfig, options)
    expect(validateOptionsForPersistence).toHaveBeenCalledWith(
      storeName,
      options
    )
    expect(logger).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('applies custom middlewares when provided', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const customMiddleware1: ZfyMiddlewareType<any> = jest.fn(
      <T>(_storeName: string, config: T) => config
    )
    const customMiddleware2: ZfyMiddlewareType<any> = jest.fn(
      <T>(_storeName: string, config: T) => config
    )
    const options: CreateStoreOptionsType<any> = {
      customMiddlewares: [customMiddleware1, customMiddleware2],
    }
    const applyMiddlewares = createMiddlewares(storeName, options)

    applyMiddlewares(storeName, mockConfig)

    expect(customMiddleware1).toHaveBeenCalled()
    expect(customMiddleware2).toHaveBeenCalled()
  })

  it('does not apply custom middlewares when array is empty', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const options: CreateStoreOptionsType<any> = {
      customMiddlewares: [],
    }
    const applyMiddlewares = createMiddlewares(storeName, options)

    const result = applyMiddlewares(storeName, mockConfig)

    expect(result).toBe(mockConfig)
  })

  it('applies all middlewares in correct order', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const customMiddleware: ZfyMiddlewareType<any> = jest.fn(
      <T>(_storeName: string, config: T) => config
    )
    const options: CreateStoreOptionsType<any> = {
      log: true,
      subscribe: true,
      persist: { storage } as any,
      customMiddlewares: [customMiddleware],
    }

    // Reset mocks to track call order
    logger.mockImplementation(<T>(_storeName: string, config: T) => config)
    subscribe.mockImplementation(<T>(_storeName: string, config: T) => config)
    persist.mockImplementation(<T>(_storeName: string, config: T) => config)

    const applyMiddlewares = createMiddlewares(storeName, options)
    applyMiddlewares(storeName, mockConfig)

    // Verify all middlewares were called
    expect(logger).toHaveBeenCalled()
    expect(subscribe).toHaveBeenCalled()
    expect(persist).toHaveBeenCalled()
    expect(customMiddleware).toHaveBeenCalled()
  })

  it('applies middlewares in order: log -> subscribe -> persist -> custom', () => {
    const storeName = 'test'
    const storage = createJSONStorage(() => SyncStorage) as any
    const callOrder: string[] = []

    logger.mockImplementation((_storeName: string, config: any) => {
      callOrder.push('logger')
      return config
    })
    subscribe.mockImplementation((_storeName: string, config: any) => {
      callOrder.push('subscribe')
      return config
    })
    persist.mockImplementation((_storeName: string, config: any) => {
      callOrder.push('persist')
      return config
    })

    const customMiddleware: ZfyMiddlewareType<any> = jest.fn(
      <T>(_storeName: string, config: T) => {
        callOrder.push('custom')
        return config
      }
    )

    const mockConfig = jest.fn()
    const options: CreateStoreOptionsType<any> = {
      log: true,
      subscribe: true,
      persist: { storage } as any,
      customMiddlewares: [customMiddleware],
    }

    const applyMiddlewares = createMiddlewares(storeName, options)
    applyMiddlewares(storeName, mockConfig)

    expect(callOrder).toEqual(['logger', 'subscribe', 'persist', 'custom'])
  })

  it('chains middleware transformations correctly', () => {
    const storeName = 'test'
    const originalConfig = jest.fn()

    let configVersion = 0
    const createVersionedConfig = () => {
      configVersion++
      return { version: configVersion, original: originalConfig }
    }

    logger.mockImplementation(<T>() => createVersionedConfig() as any as T)
    subscribe.mockImplementation(<T>() => createVersionedConfig() as any as T)

    const options: CreateStoreOptionsType<any> = {
      log: true,
      subscribe: true,
    }

    const applyMiddlewares = createMiddlewares(storeName, options)
    const result = applyMiddlewares(storeName, originalConfig)

    // Result should be the last transformed config
    expect(result).toHaveProperty('version')
    expect((result as any).version).toBe(2)
  })

  it('validates persist options when persist middleware is applied', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const options: CreateStoreOptionsType<any> = {
      persist: { storage } as any,
    }

    const applyMiddlewares = createMiddlewares(storeName, options)
    applyMiddlewares(storeName, mockConfig)

    expect(validateOptionsForPersistence).toHaveBeenCalledWith(
      storeName,
      options
    )
    expect(persist).toHaveBeenCalled()
  })

  it('does not validate persist options when persist is not enabled', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const options: CreateStoreOptionsType<any> = {
      log: true,
      subscribe: true,
    }

    const applyMiddlewares = createMiddlewares(storeName, options)
    applyMiddlewares(storeName, mockConfig)

    expect(validateOptionsForPersistence).not.toHaveBeenCalled()
  })

  it('handles multiple custom middlewares in order', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const callOrder: number[] = []

    const customMiddleware1: ZfyMiddlewareType<any> = jest.fn(
      <T>(_n: string, config: T) => {
        callOrder.push(1)
        return config
      }
    )
    const customMiddleware2: ZfyMiddlewareType<any> = jest.fn(
      <T>(_n: string, config: T) => {
        callOrder.push(2)
        return config
      }
    )
    const customMiddleware3: ZfyMiddlewareType<any> = jest.fn(
      <T>(_n: string, config: T) => {
        callOrder.push(3)
        return config
      }
    )

    const options: CreateStoreOptionsType<any> = {
      customMiddlewares: [
        customMiddleware1,
        customMiddleware2,
        customMiddleware3,
      ],
    }

    const applyMiddlewares = createMiddlewares(storeName, options)
    applyMiddlewares(storeName, mockConfig)

    expect(callOrder).toEqual([1, 2, 3])
  })

  it('passes options to all middlewares', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const storage = createJSONStorage(() => SyncStorage) as any
    const options: CreateStoreOptionsType<any> = {
      log: true,
      subscribe: true,
      persist: { storage } as any,
    }
    const applyMiddlewares = createMiddlewares(storeName, options)
    applyMiddlewares(storeName, mockConfig)

    expect(logger).toHaveBeenCalledWith(storeName, expect.anything(), options)
    expect(subscribe).toHaveBeenCalledWith(
      storeName,
      expect.anything(),
      options
    )
    expect(persist).toHaveBeenCalledWith(storeName, expect.anything(), options)
  })

  it('works with only custom middlewares', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const customMiddleware: ZfyMiddlewareType<any> = jest.fn(
      <T>(_storeName: string, config: T) => config
    )
    const options: CreateStoreOptionsType<any> = {
      customMiddlewares: [customMiddleware],
    }

    const applyMiddlewares = createMiddlewares(storeName, options)
    applyMiddlewares(storeName, mockConfig)

    expect(customMiddleware).toHaveBeenCalledWith(
      storeName,
      mockConfig,
      options
    )
    expect(logger).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
  })

  it('handles undefined options', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()

    const applyMiddlewares = createMiddlewares(storeName, undefined)
    const result = applyMiddlewares(storeName, mockConfig)

    expect(result).toBe(mockConfig)
    expect(logger).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
  })

  it('handles empty options object', () => {
    const storeName = 'test'
    const mockConfig = jest.fn()
    const options: CreateStoreOptionsType<any> = {}

    const applyMiddlewares = createMiddlewares(storeName, options)
    const result = applyMiddlewares(storeName, mockConfig)

    expect(result).toBe(mockConfig)
    expect(logger).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
  })

  it('correctly uses pipe function to compose middlewares', () => {
    const storeName = 'test'
    const initialConfig = 'initial'
    const afterLogger = 'afterLogger'
    const afterSubscribe = 'afterSubscribe'

    logger.mockReturnValue(afterLogger as any)
    subscribe.mockReturnValue(afterSubscribe as any)

    const options: CreateStoreOptionsType<any> = {
      log: true,
      subscribe: true,
    }

    const applyMiddlewares = createMiddlewares(storeName, options)
    const result = applyMiddlewares(storeName, initialConfig as any)

    // Logger should receive initial config
    expect(logger).toHaveBeenCalledWith(storeName, initialConfig, options)

    // Subscribe should receive the result of logger
    expect(subscribe).toHaveBeenCalledWith(storeName, afterLogger, options)

    // Final result should be from subscribe
    expect(result).toBe(afterSubscribe)
  })

  it('applies custom middleware after built-in middlewares', () => {
    const storeName = 'test'
    const mockConfig = 'initial'
    const afterLogger = 'afterLogger'
    const afterCustom = 'afterCustom'

    logger.mockReturnValue(afterLogger as any)

    const customMiddleware: ZfyMiddlewareType<any> = jest.fn(
      (_storeName: string, config: any) => {
        expect(config).toBe(afterLogger)
        return afterCustom as any
      }
    )

    const options: CreateStoreOptionsType<any> = {
      log: true,
      customMiddlewares: [customMiddleware],
    }

    const applyMiddlewares = createMiddlewares(storeName, options)
    const result = applyMiddlewares(storeName, mockConfig as any)

    expect(result).toBe(afterCustom)
    expect(customMiddleware).toHaveBeenCalledWith(
      storeName,
      afterLogger,
      options
    )
  })
})
