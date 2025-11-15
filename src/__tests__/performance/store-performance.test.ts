import { initStores } from '../../core'
import { SyncStorage, data } from '../index'
import createStore from '../../core/create-store'
import { createJSONStorage } from 'zustand/middleware'
import {
  bulkUpdate,
  calculateStats,
  runMultipleTimes,
  measureExecutionTime,
} from '../utils/test-helpers'

describe('⚡ Performance > Store Operations:', () => {
  describe('store creation', () => {
    it('creates store quickly without persist', async () => {
      const time = await measureExecutionTime(() => {
        createStore('perfTest', data)
      })

      // Should create in less than 10ms
      expect(time).toBeLessThan(10)
    })

    it('creates store quickly with persist', async () => {
      const time = await measureExecutionTime(() => {
        createStore('perfTestPersist', data, {
          persist: { storage: createJSONStorage(() => SyncStorage) },
        })
      })

      // Should create in less than 20ms (persist adds overhead)
      expect(time).toBeLessThan(20)
    })

    it('handles rapid store creation', async () => {
      const times = await runMultipleTimes(() => {
        const storeName = `perfTest${Date.now()}${Math.random()}`
        createStore(storeName, data)
      }, 100)

      const stats = calculateStats(times)

      // Average should be fast
      expect(stats.mean).toBeLessThan(10)
      // Max should not be excessive
      expect(stats.max).toBeLessThan(50)
    })
  })

  describe('state updates', () => {
    it('updates state quickly', async () => {
      const store = createStore('perfUpdate', data)

      const time = await measureExecutionTime(() => {
        store.getState().update((state) => {
          state.file = 'updated'
        })
      })

      // Should update in less than 5ms
      expect(time).toBeLessThan(5)
    })

    it('handles rapid sequential updates', async () => {
      const store = createStore('perfRapidUpdate', data)

      const time = await measureExecutionTime(() => {
        for (let i = 0; i < 1000; i++) {
          store.getState().update((state) => {
            state.file = `update-${i}`
          })
        }
      })

      // 1000 updates should complete in reasonable time
      expect(time).toBeLessThan(100)
    })

    it('handles bulk updates efficiently', async () => {
      const store = createStore('perfBulk', {
        count: 0,
        value: '',
        flag: false,
      })

      const time = await measureExecutionTime(() => {
        bulkUpdate(store, { count: 100, value: 'test', flag: true })
      })

      expect(time).toBeLessThan(5)
      expect(store.getState().data).toEqual({
        count: 100,
        value: 'test',
        flag: true,
      })
    })
  })

  describe('state reads', () => {
    it('reads state quickly', async () => {
      const store = createStore('perfRead', data)

      const time = await measureExecutionTime(() => {
        for (let i = 0; i < 1000; i++) {
          store.getState().data
        }
      })

      // 1000 reads should be very fast
      expect(time).toBeLessThan(10)
    })
  })

  describe('store reset', () => {
    it('resets state quickly', async () => {
      const store = createStore('perfReset', data)

      // Make some updates
      for (let i = 0; i < 100; i++) {
        store.getState().update((state) => {
          state.file = `update-${i}`
        })
      }

      const time = await measureExecutionTime(() => {
        store.getState().reset()
      })

      expect(time).toBeLessThan(5)
      expect(store.getState().data).toEqual(data)
    })
  })

  describe('multiple stores', () => {
    it('handles multiple stores efficiently', async () => {
      const storeA = createStore('perfMultiA', data)
      const storeB = createStore('perfMultiB', data)
      const storeC = createStore('perfMultiC', data)

      const { stores } = initStores<{
        perfMultiA: typeof data
        perfMultiB: typeof data
        perfMultiC: typeof data
      }>([storeA, storeB, storeC])

      const time = await measureExecutionTime(() => {
        for (let i = 0; i < 100; i++) {
          stores.perfMultiA.getState().update((state: any) => {
            state.file = `a-${i}`
          })
          stores.perfMultiB.getState().update((state: any) => {
            state.file = `b-${i}`
          })
          stores.perfMultiC.getState().update((state: any) => {
            state.file = `c-${i}`
          })
        }
      })

      // 300 total updates should be fast
      expect(time).toBeLessThan(100)
    })
  })

  describe('persist operations', () => {
    it('persists state updates efficiently', async () => {
      const store = createStore('perfPersist', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const times = await runMultipleTimes(() => {
        store.getState().update((state) => {
          state.file = `persisted-${Date.now()}`
        })
      }, 50)

      const stats = calculateStats(times)

      // Average persist time should be reasonable
      expect(stats.mean).toBeLessThan(10)
    })
  })

  describe('subscribe operations', () => {
    it('handles subscriptions efficiently', async () => {
      const store = createStore('perfSubscribe', data, { subscribe: true })
      const listener = jest.fn()

      const time = await measureExecutionTime(() => {
        const unsubscribe = store.subscribeWithSelector?.(
          (state: any) => state.data.file,
          listener
        )

        // Make updates
        for (let i = 0; i < 100; i++) {
          store.getState().update((state) => {
            state.file = `sub-${i}`
          })
        }

        unsubscribe?.()
      })

      expect(time).toBeLessThan(100)
      expect(listener).toHaveBeenCalledTimes(100)
    })
  })

  describe('memory efficiency', () => {
    it('does not leak memory with repeated store creation', () => {
      const initialMemory = (process as any).memoryUsage?.()?.heapUsed || 0

      // Create and discard many stores
      for (let i = 0; i < 1000; i++) {
        createStore(`memTest${i}`, data)
      }

      const finalMemory = (process as any).memoryUsage?.()?.heapUsed || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })
})

describe('⚡ Performance > Stress Tests:', () => {
  describe('extreme load', () => {
    it('handles 10000 rapid updates without degradation', async () => {
      const store = createStore('stressTest', data)

      const firstBatch = await measureExecutionTime(() => {
        for (let i = 0; i < 1000; i++) {
          store.getState().update((state) => {
            state.file = `batch1-${i}`
          })
        }
      })

      const lastBatch = await measureExecutionTime(() => {
        for (let i = 9000; i < 10000; i++) {
          store.getState().update((state) => {
            state.file = `batch10-${i}`
          })
        }
      })

      // Performance should not degrade significantly
      // Last batch should not be more than 2x slower than first
      expect(lastBatch).toBeLessThan(firstBatch * 2)
    })

    it('handles many concurrent stores', () => {
      const stores = []

      for (let i = 0; i < 100; i++) {
        stores.push(createStore(`concurrent${i}`, data))
      }

      // All stores should be created successfully
      expect(stores).toHaveLength(100)

      // All stores should be functional
      stores.forEach((store, index) => {
        store.getState().update((state) => {
          state.file = `store-${index}`
        })
        expect(store.getState().data.file).toBe(`store-${index}`)
      })
    })
  })

  describe('large state objects', () => {
    it('handles large state efficiently', async () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          value: Math.random(),
        })),
      }

      const store = createStore('largeState', largeData)

      const time = await measureExecutionTime(() => {
        store.getState().update((state) => {
          state.items[0].name = 'Updated Item'
        })
      })

      // Should handle large state efficiently
      expect(time).toBeLessThan(10)
      expect(store.getState().data.items[0].name).toBe('Updated Item')
    })
  })

  describe('deep nesting', () => {
    it('handles deeply nested state', async () => {
      const deepData = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep',
                },
              },
            },
          },
        },
      }

      const store = createStore('deepState', deepData)

      const time = await measureExecutionTime(() => {
        store.getState().update((state) => {
          state.level1.level2.level3.level4.level5.value = 'updated'
        })
      })

      expect(time).toBeLessThan(5)
      expect(
        store.getState().data.level1.level2.level3.level4.level5.value
      ).toBe('updated')
    })
  })
})
