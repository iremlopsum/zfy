import React, { useState, useEffect } from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { createJSONStorage } from 'zustand/middleware'
import { createStore, initStores, PersistGate } from '../../core'
import { SyncStorage, AsyncStorage } from '../index'

/**
 * Integration Tests: Real-World Scenarios
 * Tests complex application patterns and user workflows
 */

describe('🌍 Integration > Real-World Scenarios:', () => {
  describe('multi-store application', () => {
    it('manages user authentication flow with multiple stores', async () => {
      // Create stores for a typical app
      const authStore = createStore(
        'auth',
        { user: null, token: null, isAuthenticated: false },
        {
          persist: { storage: createJSONStorage(() => SyncStorage) },
        }
      )

      const uiStore = createStore('ui', {
        theme: 'light',
        sidebarOpen: false,
        notifications: [],
      })

      const dataStore = createStore('data', { items: [], loading: false })

      const { stores } = initStores<{
        auth: { user: any; token: any; isAuthenticated: boolean }
        ui: { theme: string; sidebarOpen: boolean; notifications: any[] }
        data: { items: any[]; loading: boolean }
      }>([authStore, uiStore, dataStore])

      // Simulate login
      act(() => {
        stores.auth.getState().update((state) => {
          state.user = { id: 1, name: 'Test User' }
          state.token = 'test-token'
          state.isAuthenticated = true
        })
      })

      expect(stores.auth.getState().data.isAuthenticated).toBe(true)
      expect(stores.auth.getState().data.user?.name).toBe('Test User')

      // Simulate loading data after authentication
      act(() => {
        stores.data.getState().update((state) => {
          state.loading = true
        })
      })

      await act(async () => {
        // Simulate async data fetch
        await new Promise((resolve) => setTimeout(resolve, 10))
        stores.data.getState().update((state) => {
          state.items = [{ id: 1, name: 'Item 1' }]
          state.loading = false
        })
      })

      expect(stores.data.getState().data.loading).toBe(false)
      expect(stores.data.getState().data.items).toHaveLength(1)

      // Simulate logout
      act(() => {
        stores.auth.getState().reset()
        stores.data.getState().reset()
      })

      expect(stores.auth.getState().data.isAuthenticated).toBe(false)
      expect(stores.data.getState().data.items).toHaveLength(0)
    })

    it('handles form state with validation and submission', async () => {
      const formStore = createStore('form', {
        values: { email: '', password: '' },
        errors: {},
        isSubmitting: false,
        isValid: false,
      })

      const { stores } = initStores<{
        form: {
          values: { email: string; password: string }
          errors: Record<string, string>
          isSubmitting: boolean
          isValid: boolean
        }
      }>([formStore])

      // Update email
      act(() => {
        stores.form.getState().update((state) => {
          state.values.email = 'test@example.com'
          state.errors = {}
        })
      })

      expect(stores.form.getState().data.values.email).toBe('test@example.com')

      // Validate
      act(() => {
        stores.form.getState().update((state) => {
          const errors: Record<string, string> = {}
          if (!state.values.password) {
            errors.password = 'Password is required'
          }
          state.errors = errors
          state.isValid = Object.keys(errors).length === 0
        })
      })

      expect(stores.form.getState().data.isValid).toBe(false)
      expect(stores.form.getState().data.errors.password).toBe(
        'Password is required'
      )

      // Complete form
      act(() => {
        stores.form.getState().update((state) => {
          state.values.password = 'password123'
          state.errors = {}
          state.isValid = true
        })
      })

      expect(stores.form.getState().data.isValid).toBe(true)

      // Submit
      await act(async () => {
        stores.form.getState().update((state) => {
          state.isSubmitting = true
        })

        await new Promise((resolve) => setTimeout(resolve, 10))

        stores.form.getState().update((state) => {
          state.isSubmitting = false
        })
      })

      expect(stores.form.getState().data.isSubmitting).toBe(false)
    })
  })

  describe('data fetching and caching', () => {
    it('implements cache-first data fetching pattern', async () => {
      const cacheStore = createStore('cache', {
        data: {},
        timestamps: {},
        loading: {},
      })

      const { stores } = initStores<{
        cache: {
          data: Record<string, any>
          timestamps: Record<string, number>
          loading: Record<string, boolean>
        }
      }>([cacheStore])

      const fetchData = async (key: string) => {
        const now = Date.now()
        const cached = stores.cache.getState().data.data[key]
        const timestamp = stores.cache.getState().data.timestamps[key]

        // Use cache if fresh (< 1 second old)
        if (cached && timestamp && now - timestamp < 1000) {
          return cached
        }

        // Fetch new data
        act(() => {
          stores.cache.getState().update((state) => {
            state.loading[key] = true
          })
        })

        await new Promise((resolve) => setTimeout(resolve, 10))

        const newData = { id: key, value: 'fetched' }

        act(() => {
          stores.cache.getState().update((state) => {
            state.data[key] = newData
            state.timestamps[key] = now
            state.loading[key] = false
          })
        })

        return newData
      }

      // First fetch
      const result1 = await fetchData('item1')
      expect(result1.value).toBe('fetched')
      expect(stores.cache.getState().data.data.item1).toBeDefined()

      // Second fetch (should use cache)
      const result2 = await fetchData('item1')
      expect(result2).toEqual(result1)
      expect(stores.cache.getState().data.loading.item1).toBe(false)
    })

    it('handles optimistic updates with rollback', async () => {
      const todosStore = createStore('todos', {
        items: [{ id: 1, text: 'Buy milk', completed: false }],
        error: null,
      })

      const { stores } = initStores<{
        todos: {
          items: Array<{ id: number; text: string; completed: boolean }>
          error: string | null
        }
      }>([todosStore])

      // Save state for rollback
      const previousState = JSON.parse(
        JSON.stringify(stores.todos.getState().data)
      )

      // Optimistic update
      act(() => {
        stores.todos.getState().update((state) => {
          state.items.push({ id: 2, text: 'Buy eggs', completed: false })
        })
      })

      expect(stores.todos.getState().data.items).toHaveLength(2)

      // Simulate API failure
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))

        // Rollback on failure
        stores.todos.getState().update((state) => {
          state.items = previousState.items
          state.error = 'Failed to add item'
        })
      })

      expect(stores.todos.getState().data.items).toHaveLength(1)
      expect(stores.todos.getState().data.error).toBe('Failed to add item')
    })
  })

  describe('component lifecycle integration', () => {
    it('handles store updates during component mount/unmount', async () => {
      const lifecycleStore = createStore('lifecycle', {
        mounted: 0,
        unmounted: 0,
        active: [],
      })

      const { stores } = initStores<{
        lifecycle: {
          mounted: number
          unmounted: number
          active: string[]
        }
      }>([lifecycleStore])

      const TestComponent = ({ id }: { id: string }) => {
        useEffect(() => {
          act(() => {
            stores.lifecycle.getState().update((state) => {
              state.mounted++
              state.active.push(id)
            })
          })

          return () => {
            act(() => {
              stores.lifecycle.getState().update((state) => {
                state.unmounted++
                state.active = state.active.filter((item) => item !== id)
              })
            })
          }
        }, [id])

        return <div>Component {id}</div>
      }

      const { unmount, rerender } = render(<TestComponent id="comp1" />)

      expect(stores.lifecycle.getState().data.mounted).toBe(1)
      expect(stores.lifecycle.getState().data.active).toContain('comp1')

      // Rerender with different id
      rerender(<TestComponent id="comp2" />)

      await waitFor(() => {
        expect(stores.lifecycle.getState().data.mounted).toBe(2)
        expect(stores.lifecycle.getState().data.unmounted).toBe(1)
      })

      unmount()

      await waitFor(() => {
        expect(stores.lifecycle.getState().data.unmounted).toBe(2)
        expect(stores.lifecycle.getState().data.active).toHaveLength(0)
      })
    })

    it('handles async operations during component lifecycle', async () => {
      const asyncStore = createStore('async', {
        data: null,
        loading: false,
        error: null,
      })

      const { stores } = initStores<{
        async: { data: any; loading: boolean; error: string | null }
      }>([asyncStore])

      const AsyncComponent = () => {
        const [localData, setLocalData] = useState(null)

        useEffect(() => {
          let mounted = true

          act(() => {
            stores.async.getState().update((state) => {
              state.loading = true
            })
          })

          setTimeout(() => {
            if (mounted) {
              act(() => {
                stores.async.getState().update((state) => {
                  state.data = { value: 'loaded' }
                  state.loading = false
                })
              })
              setLocalData({ value: 'loaded' } as any)
            }
          }, 10)

          return () => {
            mounted = false
          }
        }, [])

        return <div>{localData ? 'Loaded' : 'Loading'}</div>
      }

      const { getByText, unmount } = render(<AsyncComponent />)

      expect(stores.async.getState().data.loading).toBe(true)

      await waitFor(() => {
        expect(getByText('Loaded')).toBeDefined()
        expect(stores.async.getState().data.loading).toBe(false)
        expect(stores.async.getState().data.data).toEqual({ value: 'loaded' })
      })

      unmount()
    })
  })

  describe('PersistGate with complex scenarios', () => {
    it('handles navigation with persisted state', async () => {
      const navStore = createStore(
        'navigation',
        { currentRoute: '/', history: ['/'] },
        {
          persist: { storage: createJSONStorage(() => SyncStorage) },
        }
      )

      const App = () => {
        const [route, setRoute] = useState('/')

        useEffect(() => {
          const state = navStore.getState().data
          if (state.currentRoute) {
            setRoute(state.currentRoute)
          }
        }, [])

        const navigate = (path: string) => {
          act(() => {
            navStore.getState().update((state) => {
              state.currentRoute = path
              state.history.push(path)
            })
          })
          setRoute(path)
        }

        return (
          <div>
            <div data-testid="route">{route}</div>
            <button onClick={() => navigate('/about')}>Go to About</button>
            <button onClick={() => navigate('/')}>Go to Home</button>
          </div>
        )
      }

      const { getByText, getByTestId } = render(
        <PersistGate stores={[navStore]}>
          <App />
        </PersistGate>
      )

      await waitFor(() => {
        expect(getByTestId('route')).toBeDefined()
      })

      fireEvent.click(getByText('Go to About'))

      await waitFor(() => {
        const routeEl = getByTestId('route') as any
        expect(routeEl.textContent).toBe('/about')
        expect(navStore.getState().data.currentRoute).toBe('/about')
      })

      fireEvent.click(getByText('Go to Home'))

      await waitFor(() => {
        const routeEl = getByTestId('route') as any
        expect(routeEl.textContent).toBe('/')
        expect(navStore.getState().data.history).toContain('/about')
      })
    })

    it('handles multi-step wizard with persistence', async () => {
      const wizardStore = createStore(
        'wizard',
        {
          currentStep: 1,
          completed: [] as number[],
          data: {} as Record<string, any>,
        },
        {
          persist: { storage: createJSONStorage(() => AsyncStorage) },
        }
      )

      const Wizard = () => {
        const [step, setStep] = useState(1)

        const nextStep = () => {
          act(() => {
            wizardStore.getState().update((state) => {
              state.currentStep = step + 1
              state.completed.push(step)
            })
          })
          setStep(step + 1)
        }

        const saveData = (key: string, value: any) => {
          act(() => {
            wizardStore.getState().update((state) => {
              state.data[key] = value
            })
          })
        }

        return (
          <div>
            <div data-testid="step">Step {step}</div>
            <button
              onClick={() => {
                saveData(`step${step}`, `data${step}`)
                nextStep()
              }}
            >
              Next
            </button>
          </div>
        )
      }

      const { getByText, getByTestId } = render(
        <PersistGate stores={[wizardStore]}>
          <Wizard />
        </PersistGate>
      )

      await waitFor(() => {
        expect(getByTestId('step')).toBeDefined()
      })

      fireEvent.click(getByText('Next'))

      await waitFor(() => {
        const stepEl = getByTestId('step') as any
        expect(stepEl.textContent).toBe('Step 2')
        expect(wizardStore.getState().data.completed).toContain(1)
        expect(wizardStore.getState().data.data.step1).toBe('data1')
      })
    })
  })

  describe('error recovery and resilience', () => {
    it('recovers from store corruption', async () => {
      const resilientStore = createStore(
        'resilient',
        { count: 0, valid: true },
        {
          persist: { storage: createJSONStorage(() => SyncStorage) },
        }
      )

      // Normal operation
      act(() => {
        resilientStore.getState().update((state) => {
          state.count = 5
        })
      })

      expect(resilientStore.getState().data.count).toBe(5)

      // Simulate corruption detection and recovery
      // Attempt invalid update wrapped in try-catch
      try {
        act(() => {
          resilientStore.getState().update((state) => {
            // Check for invalid state and don't apply if invalid
            const newValue = -1
            if (newValue < 0) {
              // Don't update with invalid value, throw to rollback
              throw new Error('Invalid state prevented')
            }
            state.count = newValue
          })
        })
      } catch (error) {
        // Error is caught, state should be rolled back by Immer
      }

      // State should be unchanged due to thrown error (Immer rollback)
      expect(resilientStore.getState().data.count).toBe(5)

      // Reset to recover to known good state
      act(() => {
        resilientStore.getState().reset()
      })

      expect(resilientStore.getState().data.count).toBe(0)
      expect(resilientStore.getState().data.valid).toBe(true)
    })

    it('handles concurrent updates with conflict resolution', async () => {
      const conflictStore = createStore('conflict', {
        value: 0,
        version: 0,
      })

      const { stores } = initStores<{
        conflict: { value: number; version: number }
      }>([conflictStore])

      // Simulate concurrent updates
      await act(async () => {
        const update1 = Promise.resolve().then(() => {
          stores.conflict.getState().update((state) => {
            state.value = state.value + 1
            state.version++
          })
        })

        const update2 = Promise.resolve().then(() => {
          stores.conflict.getState().update((state) => {
            state.value = state.value + 2
            state.version++
          })
        })

        await Promise.all([update1, update2])
      })

      // Both updates should have been applied
      expect(stores.conflict.getState().data.value).toBe(3)
      expect(stores.conflict.getState().data.version).toBe(2)
    })
  })
})

