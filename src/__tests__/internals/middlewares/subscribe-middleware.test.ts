import subscribeMiddleware from '../../../internals/middlewares/subscribe-middleware'
import type { CreateStoreOptionsType, StoreType } from '../../../types'

describe('🔔 Internals > Middlewares > subscribe:', () => {
  it('adds subscribeWithSelector method to api', () => {
    const storeName = 'test'
    const mockData = { count: 0 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const mockSubscribe = jest.fn(() => jest.fn())
    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const options: CreateStoreOptionsType<any> = {}
    const middleware = subscribeMiddleware(storeName, config, options)
    middleware(mockSet, mockGet, mockApi as any)

    // Config should be called with api that has subscribeWithSelector
    const apiPassedToConfig = config.mock.calls[0][2]
    expect(apiPassedToConfig).toHaveProperty('subscribeWithSelector')
    expect(typeof apiPassedToConfig.subscribeWithSelector).toBe('function')
  })

  it('calls selector on state', () => {
    const storeName = 'test'
    const mockData = { count: 5, name: 'test' }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const mockUnsubscribe = jest.fn()
    const mockSubscribe = jest.fn(() => mockUnsubscribe)
    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = jest.fn((state: StoreType<any>) => state.data.count)
    const listener = jest.fn()

    apiPassedToConfig.subscribeWithSelector(selector, listener)

    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('returns unsubscribe function', () => {
    const storeName = 'test'
    const mockData = { count: 0 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))
    const mockUnsubscribe = jest.fn()
    const mockSubscribe = jest.fn(() => mockUnsubscribe)
    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = (state: StoreType<any>) => state.data.count
    const listener = jest.fn()

    const unsubscribe = apiPassedToConfig.subscribeWithSelector(
      selector,
      listener
    )

    expect(typeof unsubscribe).toBe('function')
    expect(unsubscribe).toBe(mockUnsubscribe)
  })

  it('calls listener when selected value changes', () => {
    const storeName = 'test'
    let mockData = { count: 0 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    let registeredListener: any
    const mockSubscribe = jest.fn((listener: any) => {
      registeredListener = listener
      return jest.fn()
    })

    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = (state: StoreType<any>) => state.data.count
    const listener = jest.fn()

    apiPassedToConfig.subscribeWithSelector(selector, listener)

    // Simulate state change
    mockData = { count: 1 }
    registeredListener({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    })

    expect(listener).toHaveBeenCalledWith(1, 0)
  })

  it('does not call listener when selected value does not change', () => {
    const storeName = 'test'
    let mockData = { count: 0, other: 'value' }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    let registeredListener: any
    const mockSubscribe = jest.fn((listener: any) => {
      registeredListener = listener
      return jest.fn()
    })

    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = (state: StoreType<any>) => state.data.count
    const listener = jest.fn()

    apiPassedToConfig.subscribeWithSelector(selector, listener)

    // Simulate state change where count doesn't change
    mockData = { count: 0, other: 'changed' }
    registeredListener({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    })

    expect(listener).not.toHaveBeenCalled()
  })

  it('uses custom equality function when provided', () => {
    const storeName = 'test'
    let mockData = { count: 0 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    let registeredListener: any
    const mockSubscribe = jest.fn((listener: any) => {
      registeredListener = listener
      return jest.fn()
    })

    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = (state: StoreType<any>) => state.data.count
    const listener = jest.fn()
    const customEqualityFn = jest.fn(() => true) // Always equal

    apiPassedToConfig.subscribeWithSelector(selector, listener, {
      equalityFn: customEqualityFn,
    })

    // Simulate state change
    mockData = { count: 5 }
    registeredListener({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    })

    // Listener should not be called because custom equality returns true
    expect(customEqualityFn).toHaveBeenCalledWith(0, 5)
    expect(listener).not.toHaveBeenCalled()
  })

  it('fires immediately when fireImmediately option is true', () => {
    const storeName = 'test'
    const mockData = { count: 5 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const mockSubscribe = jest.fn(() => jest.fn())
    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = (state: StoreType<any>) => state.data.count
    const listener = jest.fn()

    apiPassedToConfig.subscribeWithSelector(selector, listener, {
      fireImmediately: true,
    })

    // Listener should be called immediately with current value
    expect(listener).toHaveBeenCalledWith(5, 5)
  })

  it('does not fire immediately when fireImmediately option is false or undefined', () => {
    const storeName = 'test'
    const mockData = { count: 5 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const mockSubscribe = jest.fn(() => jest.fn())
    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = (state: StoreType<any>) => state.data.count
    const listener = jest.fn()

    apiPassedToConfig.subscribeWithSelector(selector, listener, {
      fireImmediately: false,
    })

    expect(listener).not.toHaveBeenCalled()
  })

  it('works without a listener (returns selector result)', () => {
    const storeName = 'test'
    const mockData = { count: 5 }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const mockUnsubscribe = jest.fn()
    const mockSubscribe = jest.fn(() => mockUnsubscribe)
    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = (state: StoreType<any>) => state.data.count

    // Call without listener
    const unsubscribe = apiPassedToConfig.subscribeWithSelector(
      selector,
      null as any
    )

    expect(typeof unsubscribe).toBe('function')
    expect(mockSubscribe).toHaveBeenCalled()
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
    const mockApi = {
      subscribe: jest.fn(() => jest.fn()),
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: {},
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    expect(config).toHaveBeenCalledWith(mockSet, mockGet, expect.any(Object))
  })

  it('uses Object.is as default equality function', () => {
    const storeName = 'test'
    let mockData = { count: 0, obj: { nested: 'value' } }
    const mockSet = jest.fn()
    const mockGet = jest.fn(() => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    let registeredListener: any
    const mockSubscribe = jest.fn((listener: any) => {
      registeredListener = listener
      return jest.fn()
    })

    const mockApi = {
      subscribe: mockSubscribe,
      getState: mockGet,
    }

    const config = jest.fn((_set: any, _get: any, _api: any) => ({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    }))

    const middleware = subscribeMiddleware(storeName, config)
    middleware(mockSet, mockGet, mockApi as any)

    const apiPassedToConfig = config.mock.calls[0][2]
    const selector = (state: StoreType<any>) => state.data.obj
    const listener = jest.fn()

    apiPassedToConfig.subscribeWithSelector(selector, listener)

    const oldObj = mockData.obj
    // Change to a new object with same content
    mockData = { count: 0, obj: { nested: 'value' } }
    registeredListener({
      data: mockData,
      name: storeName,
      update: jest.fn(),
      reset: jest.fn(),
    })

    // Should be called because Object.is checks reference equality
    expect(listener).toHaveBeenCalled()
    expect(listener).toHaveBeenCalledWith(mockData.obj, oldObj)
  })
})
