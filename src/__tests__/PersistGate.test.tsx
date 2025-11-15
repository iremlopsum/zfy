import React from 'react'
import { createJSONStorage } from 'zustand/middleware'
import { render, waitFor } from '@testing-library/react'

import PersistGate from '../core/PersistGate'
import createStore from '../core/create-store'
import { data, SyncStorage, AsyncStorage, rehydratedData } from '.'

describe('🚪 Core > PersistGate:', () => {
  describe('basic functionality', () => {
    it('renders loader and children after rehydration with sync storage', async () => {
      const loader = jest.fn()
      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { container } = await waitFor(() =>
        render(
          <PersistGate stores={[store]} loader={loader}>
            <div>
              <span>My App</span>
            </div>
          </PersistGate>
        )
      )

      expect(container).toMatchSnapshot()
      expect(loader).toHaveBeenCalled()
      expect(store.getState().data).toEqual(rehydratedData)
    })

    it('renders loader and children after rehydration with async storage', async () => {
      const loader = jest.fn()
      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })

      const { container } = render(
        <PersistGate stores={[store]} loader={loader}>
          <div>
            <span>My App</span>
          </div>
        </PersistGate>
      )

      expect(container).toMatchSnapshot()
      expect(loader).toHaveBeenCalled()

      await waitFor(
        () => {
          expect(store.getState().data).toEqual(rehydratedData)
        },
        { timeout: 500 }
      )
    })
  })

  describe('children variants', () => {
    it('renders children as function after rehydration', async () => {
      const childrenFn = jest.fn(() => <div>Function Children Content</div>)

      const store = createStore('jestChildrenFn', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { getByText } = render(
        <PersistGate stores={[store]}>{childrenFn}</PersistGate>
      )

      await waitFor(() => {
        expect(getByText('Function Children Content')).toBeDefined()
      })

      // Should have been called after rehydration
      expect(childrenFn).toHaveBeenCalled()
    })

    it('supports JSX children', async () => {
      const store = createStore('jestJSX', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { getByText } = render(
        <PersistGate stores={[store]}>
          <div>JSX Children</div>
        </PersistGate>
      )

      await waitFor(() => {
        expect(getByText('JSX Children')).toBeDefined()
      })
    })

    it('renders empty div when minimal children provided', async () => {
      const store = createStore('jestNoChildren', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { container } = await waitFor(() =>
        render(
          <PersistGate stores={[store]}>
            <div />
          </PersistGate>
        )
      )

      expect((container as any).querySelector('div')).toBeDefined()
    })
  })

  describe('loader variants', () => {
    it('renders loader as function component', async () => {
      const LoaderComponent = () => <div>Loading...</div>
      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })

      const { getByText } = render(
        <PersistGate stores={[store]} loader={<LoaderComponent />}>
          <div>App</div>
        </PersistGate>
      )

      expect(getByText('Loading...')).toBeDefined()

      await waitFor(
        () => {
          expect(store.getState().data).toEqual(rehydratedData)
        },
        { timeout: 500 }
      )
    })

    it('renders loader as JSX element', async () => {
      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })

      const { getByText } = render(
        <PersistGate stores={[store]} loader={<div>Custom Loader</div>}>
          <div>App</div>
        </PersistGate>
      )

      expect(getByText('Custom Loader')).toBeDefined()

      await waitFor(
        () => {
          expect(store.getState().data).toEqual(rehydratedData)
        },
        { timeout: 500 }
      )
    })

    it('works without loader prop', async () => {
      const store = createStore('jest', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { container } = await waitFor(() =>
        render(
          <PersistGate stores={[store]}>
            <div>App</div>
          </PersistGate>
        )
      )

      const divElement = (container as any).querySelector('div')
      expect(divElement).toBeDefined()
    })
  })

  describe('multiple stores', () => {
    it('waits for all stores to rehydrate with sync storage', async () => {
      const storeA = createStore('jestA', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })
      const storeB = createStore('jestB', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { getByText } = await waitFor(() =>
        render(
          <PersistGate stores={[storeA, storeB]}>
            <div>All Stores Rehydrated</div>
          </PersistGate>
        )
      )

      expect(getByText('All Stores Rehydrated')).toBeDefined()
      expect(storeA.getState().data).toEqual(rehydratedData)
      expect(storeB.getState().data).toEqual(rehydratedData)
    })

    it('waits for all stores to rehydrate with async storage', async () => {
      const storeA = createStore('jestAsyncA', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })
      const storeB = createStore('jestAsyncB', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })

      const { getByText, queryByText } = render(
        <PersistGate stores={[storeA, storeB]} loader={<div>Loading</div>}>
          <div>All Stores Rehydrated</div>
        </PersistGate>
      )

      expect(getByText('Loading')).toBeDefined()

      await waitFor(
        () => {
          expect(storeA.getState().data).toEqual(rehydratedData)
          expect(storeB.getState().data).toEqual(rehydratedData)
        },
        { timeout: 600 }
      )

      await waitFor(
        () => {
          expect(queryByText('All Stores Rehydrated')).toBeDefined()
        },
        { timeout: 100 }
      )
    })

    it('handles mixed sync and async stores', async () => {
      const syncStore = createStore('jestA', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })
      const asyncStore = createStore('jestB', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })

      const { getByText } = render(
        <PersistGate
          stores={[syncStore, asyncStore]}
          loader={<div>Loading</div>}
        >
          <div>Mixed Stores Ready</div>
        </PersistGate>
      )

      expect(getByText('Loading')).toBeDefined()

      await waitFor(
        () => {
          expect(syncStore.getState().data).toEqual(rehydratedData)
          expect(asyncStore.getState().data).toEqual(rehydratedData)
          expect(getByText('Mixed Stores Ready')).toBeDefined()
        },
        { timeout: 500 }
      )
    })
  })

  describe('stores without persist', () => {
    it('renders when store has no persist middleware', async () => {
      const storeWithoutPersist = createStore('jestNoPersist', data)

      const { getByText } = render(
        <PersistGate stores={[storeWithoutPersist]}>
          <div>Immediate Render</div>
        </PersistGate>
      )

      await waitFor(() => {
        expect(getByText('Immediate Render')).toBeDefined()
      })

      expect(storeWithoutPersist.getState().data).toEqual(data)
    })

    it('handles mix of persist and non-persist stores', async () => {
      const persistStore = createStore('jestMixedA', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })
      const nonPersistStore = createStore('jestMixedB', data)

      const { getByText } = render(
        <PersistGate stores={[persistStore, nonPersistStore]}>
          <div>Mixed Store Types</div>
        </PersistGate>
      )

      await waitFor(() => {
        expect(getByText('Mixed Store Types')).toBeDefined()
      })

      expect(persistStore.getState().data).toEqual(rehydratedData)
      expect(nonPersistStore.getState().data).toEqual(data)
    })
  })

  describe('error scenarios', () => {
    it('throws error when stores prop is not provided', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        render(
          // @ts-expect-error - testing invalid input
          <PersistGate>
            <div>Children</div>
          </PersistGate>
        )
      }).toThrow()

      consoleError.mockRestore()
    })

    it('throws error when stores prop is empty array', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        render(
          <PersistGate stores={[]}>
            <div>Children</div>
          </PersistGate>
        )
      }).toThrow(
        "You must provide an array of your zustand stores to <PersisGate /> 'stores' prop."
      )

      consoleError.mockRestore()
    })

    it('throws error when stores prop is not an array', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        render(
          <PersistGate stores={'not-an-array' as any}>
            <div>Children</div>
          </PersistGate>
        )
      }).toThrow()

      consoleError.mockRestore()
    })
  })

  describe('re-rendering behavior', () => {
    it('does not cause unnecessary re-renders after rehydration', async () => {
      const renderCount = { count: 0 }
      const ChildComponent = () => {
        renderCount.count++
        return <div>Child</div>
      }

      const store = createStore('jestRender', data, {
        persist: { storage: createJSONStorage(() => SyncStorage) },
      })

      const { getByText } = render(
        <PersistGate stores={[store]}>
          <ChildComponent />
        </PersistGate>
      )

      await waitFor(() => {
        expect(getByText('Child')).toBeDefined()
      })

      // Should render twice max: once before, once after rehydration
      expect(renderCount.count).toBeLessThanOrEqual(2)
    })

    it('properly updates when rehydration completes asynchronously', async () => {
      const childrenFn = jest.fn(() => <div>Async Content</div>)

      const store = createStore('jestAsync', data, {
        persist: { storage: createJSONStorage(() => AsyncStorage) },
      })

      const { getByText } = render(
        <PersistGate stores={[store]}>{childrenFn}</PersistGate>
      )

      // Wait for rehydration to complete
      await waitFor(
        () => {
          expect(store.getState().data).toEqual(rehydratedData)
          expect(getByText('Async Content')).toBeDefined()
        },
        { timeout: 500 }
      )

      // Should have been called after rehydration
      expect(childrenFn).toHaveBeenCalled()
    })
  })
})
