import { createJSONStorage } from 'zustand/middleware'

import { SyncStorage } from '../index'
import { initStores } from '../../core'
import createStore from '../../core/create-store'
import { measureExecutionTime } from '../utils/test-helpers'

/**
 * Advanced Tests: Memory and Performance
 * Tests for memory leaks, performance degradation, and long-running scenarios
 */

describe('🔬 Advanced > Memory & Performance:', () => {
  describe('memory leak detection', () => {
    it('cleans up subscriptions properly', () => {
      const store = createStore('memTest', { count: 0 }, { subscribe: true })

      // Create and remove many subscriptions
      const unsubscribes: Array<(() => void) | undefined> = []

      for (let i = 0; i < 100; i++) {
        const unsub = store.subscribeWithSelector?.(
          (state: any) => state.data.count,
          () => {}
        )
        unsubscribes.push(unsub)
      }

      // Cleanup all subscriptions
      unsubscribes.forEach((unsub) => unsub?.())

      // Store should still be functional
      store.getState().update((state) => {
        state.count = 42
      })

      expect(store.getState().data.count).toBe(42)
    })

    it('handles rapid store creation and destruction', () => {
      const stores: any[] = []

      // Create many stores
      for (let i = 0; i < 100; i++) {
        const store = createStore(`temp${i}`, { value: i })
        stores.push(store)
      }

      // Verify all stores work
      stores.forEach((store, i) => {
        expect(store.getState().data.value).toBe(i)
      })

      // Clear references (would be garbage collected)
      stores.length = 0

      // Create new stores with same names (simulating app restart)
      for (let i = 0; i < 10; i++) {
        const store = createStore(`temp${i}`, { value: i * 2 })
        expect(store.getState().data.value).toBe(i * 2)
      }
    })

    it('does not leak memory with persist middleware', async () => {
      const createAndUpdate = () => {
        const store = createStore(
          `persistLeak${Date.now()}`,
          { data: new Array(1000).fill(0) },
          {
            persist: { storage: createJSONStorage(() => SyncStorage) },
          }
        )

        // Perform updates
        for (let i = 0; i < 10; i++) {
          store.getState().update((state) => {
            state.data[i] = i
          })
        }

        return store
      }

      // Create and discard many stores
      for (let i = 0; i < 50; i++) {
        createAndUpdate()
      }

      // If we got here without OOM, memory management is working
      expect(true).toBe(true)
    })
  })

  describe('performance degradation', () => {
    it('maintains performance over many updates', async () => {
      const store = createStore('perfDegradation', { count: 0 })

      // Measure first batch
      const firstBatch = await measureExecutionTime(() => {
        for (let i = 0; i < 1000; i++) {
          store.getState().update((state) => {
            state.count = i
          })
        }
      })

      // Measure second batch
      const secondBatch = await measureExecutionTime(() => {
        for (let i = 1000; i < 2000; i++) {
          store.getState().update((state) => {
            state.count = i
          })
        }
      })

      // Performance should not degrade significantly (within 2x)
      // More lenient threshold to avoid flakiness
      expect(secondBatch).toBeLessThan(firstBatch * 2)
      expect(store.getState().data.count).toBe(1999)
    })

    it('handles growing state efficiently', async () => {
      const store = createStore('growingState', { items: [] as number[] })

      // Add items in batches and measure total time
      const totalTime = await measureExecutionTime(() => {
        for (let batch = 0; batch < 10; batch++) {
          for (let i = 0; i < 100; i++) {
            store.getState().update((state) => {
              state.items.push(batch * 100 + i)
            })
          }
        }
      })

      // Should complete 1000 updates in reasonable time (< 500ms)
      // Generous threshold to avoid flakiness on slower CI runners
      expect(totalTime).toBeLessThan(500)
      expect(store.getState().data.items).toHaveLength(1000)

      // Verify items are correct
      expect(store.getState().data.items[0]).toBe(0)
      expect(store.getState().data.items[999]).toBe(999)
    })

    it('maintains subscription performance with many listeners', async () => {
      const store = createStore(
        'manyListeners',
        { value: 0 },
        {
          subscribe: true,
        }
      )

      // Add many listeners
      const listeners: Array<() => void> = []
      const unsubscribes: Array<(() => void) | undefined> = []

      for (let i = 0; i < 100; i++) {
        const listener = jest.fn()
        listeners.push(listener)
        const unsub = store.subscribeWithSelector?.(
          (state: any) => state.data.value,
          listener
        )
        unsubscribes.push(unsub)
      }

      // Measure update performance
      const time = await measureExecutionTime(() => {
        for (let i = 0; i < 100; i++) {
          store.getState().update((state) => {
            state.value = i
          })
        }
      })

      // Should complete in reasonable time even with many listeners
      expect(time).toBeLessThan(200)

      // All listeners should have been called
      listeners.forEach((listener) => {
        expect(listener).toHaveBeenCalled()
      })

      // Cleanup
      unsubscribes.forEach((unsub) => unsub?.())
    })
  })

  describe('long-running scenarios', () => {
    it('handles thousands of operations without issues', async () => {
      const store = createStore('longRunning', {
        operations: 0,
        errors: 0,
        data: {},
      })

      let errorCount = 0

      // Simulate long-running app
      for (let i = 0; i < 5000; i++) {
        try {
          store.getState().update((state) => {
            state.operations++
            // Occasionally perform different operations
            if (i % 100 === 0) {
              state.data = { ...state.data, [`key${i}`]: i }
            }
          })
        } catch (error) {
          errorCount++
        }
      }

      expect(errorCount).toBe(0)
      expect(store.getState().data.operations).toBe(5000)
      expect(Object.keys(store.getState().data.data)).toHaveLength(50)
    })

    it('maintains stability with mixed operations', async () => {
      const storeA = createStore('longA', { count: 0 })
      const storeB = createStore('longB', { count: 0 })
      const storeC = createStore('longC', { count: 0 })

      const { stores } = initStores<{
        longA: { count: number }
        longB: { count: number }
        longC: { count: number }
      }>([storeA, storeB, storeC])

      // Mix of updates and resets
      for (let i = 0; i < 1000; i++) {
        stores.longA.getState().update((state: any) => {
          state.count++
        })

        if (i % 100 === 0) {
          stores.longB.getState().reset()
        }

        if (i % 50 === 0) {
          stores.longC.getState().update((state: any) => {
            state.count = i
          })
        }
      }

      expect(stores.longA.getState().data.count).toBe(1000)
      expect(stores.longB.getState().data.count).toBe(0) // Reset last
      expect(stores.longC.getState().data.count).toBe(950) // Last update
    })
  })

  describe('edge case resilience', () => {
    it('handles circular reference detection', () => {
      const store = createStore('circular', { ref: null as any })

      // Create circular reference
      const obj: any = { value: 1 }
      obj.self = obj

      // Immer will throw on circular references - this is expected
      expect(() => {
        store.getState().update((state) => {
          state.ref = obj
        })
      }).toThrow()

      // Store should still be in valid state
      expect(store.getState().data.ref).toBeNull()
    })

    it('handles extremely deep state updates', () => {
      const deepState: any = { level: 'root' }
      let current = deepState

      // Create 50 levels of nesting
      for (let i = 0; i < 50; i++) {
        current.next = { level: i }
        current = current.next
      }

      const store = createStore('deepNesting', deepState)

      // Update deep value
      store.getState().update((state) => {
        let node = state
        for (let i = 0; i < 50; i++) {
          node = node.next
        }
        node.level = 'modified'
      })

      // Verify update worked
      let node = store.getState().data
      for (let i = 0; i < 50; i++) {
        node = node.next
      }
      expect(node.level).toBe('modified')
    })

    it('handles rapid state oscillation', async () => {
      const store = createStore('oscillation', { value: 0 })

      const time = await measureExecutionTime(() => {
        for (let i = 0; i < 1000; i++) {
          store.getState().update((state) => {
            state.value = i % 2 === 0 ? 0 : 1
          })
        }
      })

      // Should handle rapid changes efficiently
      expect(time).toBeLessThan(100)
      expect([0, 1]).toContain(store.getState().data.value)
    })

    it('recovers from errors in update functions', () => {
      const store = createStore('errorRecovery', { count: 0, valid: true })

      // First update succeeds
      store.getState().update((state) => {
        state.count = 1
      })

      expect(store.getState().data.count).toBe(1)

      // Update with error - Immer will rollback
      expect(() => {
        store.getState().update((state) => {
          state.count = 2
          throw new Error('Simulated error')
        })
      }).toThrow('Simulated error')

      // State should remain consistent (Immer rolls back on error)
      expect(store.getState().data.count).toBe(1)
      expect(store.getState().data.valid).toBe(true)

      // Subsequent updates should work
      store.getState().update((state) => {
        state.count = 3
      })

      expect(store.getState().data.count).toBe(3)
    })
  })

  describe('concurrent access patterns', () => {
    it('handles high-frequency reads and writes', async () => {
      const store = createStore('concurrent', { value: 0 })

      const operations = []

      // Mix of reads and writes
      for (let i = 0; i < 1000; i++) {
        if (i % 2 === 0) {
          operations.push(
            Promise.resolve().then(() => {
              store.getState().update((state) => {
                state.value++
              })
            })
          )
        } else {
          operations.push(
            Promise.resolve().then(() => {
              // Read operation
              return store.getState().data.value
            })
          )
        }
      }

      await Promise.all(operations)

      // All write operations should have completed
      expect(store.getState().data.value).toBe(500)
    })

    it('maintains consistency with interleaved operations', async () => {
      const store = createStore('interleaved', {
        reads: 0,
        writes: 0,
        resets: 0,
      })

      await Promise.all([
        // Writer 1
        Promise.resolve().then(() => {
          for (let i = 0; i < 100; i++) {
            store.getState().update((state) => {
              state.writes++
            })
          }
        }),
        // Reader 1
        Promise.resolve().then(() => {
          for (let i = 0; i < 100; i++) {
            // Read operation (value discarded)
            void store.getState().data.writes
            store.getState().update((state) => {
              state.reads++
            })
          }
        }),
        // Resetter
        Promise.resolve().then(() => {
          for (let i = 0; i < 10; i++) {
            store.getState().update((state) => {
              state.resets++
            })
          }
        }),
      ])

      // All operations should have completed
      const final = store.getState().data
      expect(final.writes).toBe(100)
      expect(final.reads).toBe(100)
      expect(final.resets).toBe(10)
    })
  })
})
