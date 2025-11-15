import { createJSONStorage } from 'zustand/middleware'

import { SyncStorage, AsyncStorage } from '../index'

import type { CreateStoreType } from '../../types'

/**
 * Test Helpers
 * Reusable utilities for testing stores and components
 */

// Storage Helpers
export const createFailingStorage = (
  operation: 'getItem' | 'setItem' | 'removeItem'
) => {
  const error = new Error(`Storage ${operation} failed`)
  return {
    getItem:
      operation === 'getItem'
        ? () => {
            throw error
          }
        : SyncStorage.getItem,
    setItem:
      operation === 'setItem'
        ? () => {
            throw error
          }
        : SyncStorage.setItem,
    removeItem:
      operation === 'removeItem'
        ? () => {
            throw error
          }
        : SyncStorage.removeItem,
  }
}

export const createQuotaExceededStorage = () => {
  const error: any = new Error('QuotaExceededError')
  error.name = 'QuotaExceededError'
  return {
    getItem: SyncStorage.getItem,
    setItem: () => {
      throw error
    },
    removeItem: SyncStorage.removeItem,
  }
}

export const createCorruptedStorage = (
  type: 'malformed' | 'missing-state' | 'null' | 'undefined'
) => {
  const storageMap = {
    'malformed': () => 'invalid-json{{{',
    'missing-state': () => JSON.stringify({ version: 0 }),
    'null': () => null,
    'undefined': () => undefined as any,
  }

  return {
    getItem: storageMap[type],
    setItem: SyncStorage.setItem,
    removeItem: SyncStorage.removeItem,
  }
}

// Store Helpers
export const createTestStoreOptions = (options?: {
  sync?: boolean
  persist?: boolean
  log?: boolean
  subscribe?: boolean
}) => {
  const {
    sync = true,
    persist = false,
    log = false,
    subscribe = false,
  } = options || {}

  const storeOptions: any = { log, subscribe }

  if (persist) {
    storeOptions.persist = {
      storage: sync
        ? createJSONStorage(() => SyncStorage)
        : createJSONStorage(() => AsyncStorage),
    }
  }

  return storeOptions
}

// Assertion Helpers
export const expectStoreToHaveState = <T>(
  store: CreateStoreType<T>,
  expectedState: Partial<T>
) => {
  const state = store.getState()
  Object.entries(expectedState).forEach(([key, value]) => {
    expect((state as any)[key]).toEqual(value)
  })
}

export const expectStoreToHaveMethods = (store: CreateStoreType<any>) => {
  expect(store.getState).toBeDefined()
  expect(store.getState().update).toBeDefined()
  expect(store.getState().reset).toBeDefined()
  expect(typeof store.getState).toBe('function')
  expect(typeof store.getState().update).toBe('function')
  expect(typeof store.getState().reset).toBe('function')
}

// Console Mock Helpers
export const mockConsole = () => {
  const mocks = {
    group: jest.spyOn(console, 'group').mockImplementation(),
    debug: jest.spyOn(console, 'debug').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    log: jest.spyOn(console, 'log').mockImplementation(),
  }

  const restore = () => {
    Object.values(mocks).forEach((mock) => mock.mockRestore())
  }

  return { mocks, restore }
}

// Async Helpers
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> => {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`)
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

// Performance Helpers
export const measureExecutionTime = async (
  fn: () => void | Promise<void>
): Promise<number> => {
  const start = Date.now()
  await fn()
  return Date.now() - start
}

export const runMultipleTimes = async (
  fn: () => void | Promise<void>,
  times: number
): Promise<number[]> => {
  const executions: number[] = []
  for (let i = 0; i < times; i++) {
    const time = await measureExecutionTime(fn)
    executions.push(time)
  }
  return executions
}

export const calculateStats = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const sum = values.reduce((acc, val) => acc + val, 0)
  const mean = sum / values.length
  const median = sorted[Math.floor(values.length / 2)]
  const min = sorted[0]
  const max = sorted[values.length - 1]

  return { mean, median, min, max, count: values.length }
}

// Store State Manipulation Helpers
export const bulkUpdate = <T extends Record<string, any>>(
  store: CreateStoreType<T>,
  updates: Partial<T>
) => {
  store.getState().update((state) => {
    Object.assign(state, updates)
  })
}

export const createStoreSnapshot = <T>(store: CreateStoreType<T>): T => {
  return JSON.parse(JSON.stringify(store.getState().data))
}

export const restoreStoreSnapshot = <T>(
  store: CreateStoreType<T>,
  snapshot: T
) => {
  store.getState().update(() => snapshot)
}
