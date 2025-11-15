import loggerMiddleware from '../../../internals/middlewares/logger-middleware'
import type { CreateStoreOptionsType } from '../../../types'

describe('📝 Internals > Middlewares > logger:', () => {
  let consoleGroup: jest.SpyInstance
  let consoleDebug: jest.SpyInstance
  let consoleGroupEnd: jest.SpyInstance

  beforeEach(() => {
    consoleGroup = jest.spyOn(console, 'group').mockImplementation()
    consoleDebug = jest.spyOn(console, 'debug').mockImplementation()
    consoleGroupEnd = jest.spyOn(console, 'groupEnd').mockImplementation()
  })

  afterEach(() => {
    consoleGroup.mockRestore()
    consoleDebug.mockRestore()
    consoleGroupEnd.mockRestore()
  })

  it('returns a function that returns store config', () => {
    const storeName = 'test'
    const config = jest.fn(() => ({
      data: {},
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const options: CreateStoreOptionsType<any> = { log: true }

    const middleware = loggerMiddleware(storeName, config, options)
    expect(typeof middleware).toBe('function')
  })

  it('does not log when options.log is false', () => {
    const storeName = 'test'
    const mockData = { count: 0 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const mockApi = {} as any

    const config = jest.fn((_setFn: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const options: CreateStoreOptionsType<any> = { log: false }
    const middleware = loggerMiddleware(storeName, config, options)
    middleware(mockSet, mockGet, mockApi)

    // Simulate a state update
    const setFn = config.mock.calls[0]?.[0]
    setFn?.({ data: { count: 1 } })

    expect(consoleGroup).not.toHaveBeenCalled()
    expect(consoleDebug).not.toHaveBeenCalled()
  })

  it('does not log when options.log is undefined', () => {
    const storeName = 'test'
    const mockData = { count: 0 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const mockApi = {} as any

    const config = jest.fn((_setFn: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = loggerMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi)

    const setFn = config.mock.calls[0]?.[0]
    setFn?.({ data: { count: 1 } })

    expect(consoleGroup).not.toHaveBeenCalled()
    expect(consoleDebug).not.toHaveBeenCalled()
  })

  it('logs state changes when options.log is true', () => {
    const storeName = 'test'
    const prevData = { count: 0 }
    const newData = { count: 1 }

    let currentData = prevData
    const mockSet = jest.fn((updater: any) => {
      if (typeof updater === 'function') {
        currentData = updater({ data: currentData }).data
      } else {
        currentData = updater.data
      }
    })

    const mockGet = jest.fn(() => ({
      data: currentData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const mockApi = {} as any

    const config = jest.fn((_setFn: any) => ({
      data: prevData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const options: CreateStoreOptionsType<any> = { log: true }
    const middleware = loggerMiddleware(storeName, config, options)
    middleware(mockSet, mockGet, mockApi)

    // Get the wrapped set function
    const wrappedSet = config.mock.calls[0]?.[0]

    // Simulate a state update
    wrappedSet?.({ data: newData })

    expect(consoleGroup).toHaveBeenCalledWith(
      '%c🗂 TEST STORE UPDATED',
      'font-weight:bold'
    )
    expect(consoleDebug).toHaveBeenCalledWith(
      '%cprevState',
      'font-weight:bold; color: #9E9E9E',
      prevData
    )
    expect(consoleDebug).toHaveBeenCalledWith(
      '%cpayload',
      'font-weight:bold; color: #27A3F7',
      newData
    )
    expect(consoleDebug).toHaveBeenCalledWith(
      '%cnewState',
      'font-weight:bold; color: #C6E40A',
      newData
    )
    expect(consoleGroupEnd).toHaveBeenCalled()
  })

  it('converts store name to uppercase in log message', () => {
    const storeName = 'myTestStore'
    const mockData = { count: 0 }
    let currentData = mockData

    const mockSet = jest.fn((updater: any) => {
      if (typeof updater === 'function') {
        currentData = updater({ data: currentData }).data
      } else {
        currentData = updater.data
      }
    })

    const mockGet = jest.fn(() => ({
      data: currentData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const mockApi = {} as any

    const config = jest.fn((_setFn: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const options: CreateStoreOptionsType<any> = { log: true }
    const middleware = loggerMiddleware(storeName, config, options)
    middleware(mockSet, mockGet, mockApi)

    const wrappedSet = config.mock.calls[0]?.[0]
    wrappedSet?.({ data: { count: 1 } })

    expect(consoleGroup).toHaveBeenCalledWith(
      '%c🗂 MYTESTSTORE STORE UPDATED',
      'font-weight:bold'
    )
  })

  it('handles function-based state updates', () => {
    const storeName = 'test'
    const prevData = { count: 0 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: prevData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const mockApi = {} as any

    const config = jest.fn((_setFn: any) => ({
      data: prevData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const options: CreateStoreOptionsType<any> = { log: true }
    const middleware = loggerMiddleware(storeName, config, options)
    middleware(mockSet, mockGet, mockApi)

    const wrappedSet = config.mock.calls[0]?.[0]

    // Simulate a function-based update
    wrappedSet?.((state: any) => ({ data: { count: state.data.count + 1 } }))

    expect(consoleGroup).toHaveBeenCalled()
    expect(consoleDebug).toHaveBeenCalledWith(
      '%cprevState',
      'font-weight:bold; color: #9E9E9E',
      prevData
    )
  })

  it('passes through set, get, and api to config', () => {
    const storeName = 'test'
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: {},
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const mockApi = { subscribe: jest.fn() } as any

    const config = jest.fn(() => ({
      data: {},
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = loggerMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi)

    expect(config).toHaveBeenCalledWith(expect.any(Function), mockGet, mockApi)
  })

  it('calls mockSet when state is updated', () => {
    const storeName = 'test'
    const mockData = { count: 0 }
    let currentData = mockData

    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: currentData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const mockApi = {} as any

    const config = jest.fn((_setFn: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const options: CreateStoreOptionsType<any> = { log: true }
    const middleware = loggerMiddleware(storeName, config, options)
    middleware(mockSet, mockGet, mockApi)

    const wrappedSet = config.mock.calls[0]?.[0]
    const newState = { data: { count: 1 } }

    wrappedSet?.(newState)

    expect(mockSet).toHaveBeenCalledWith(newState)
  })
})
