import React from 'react'
import { createJSONStorage } from 'zustand/middleware'
import { render, waitFor } from '@testing-library/react'

import PersistGate from '../core/PersistGate'
import createStore from '../core/create-store'
import { data, sleep, SyncStorage, AsyncStorage, rehydratedData } from '.'

describe('🚪 Core > PersistGate:', () => {
  it('renders loader and rehydrates with sync storage', async () => {
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

    expect.assertions(3)
  })

  it('renders loader and rehydrates with async storage', async () => {
    const loader = jest.fn()
    const store = createStore('jest', data, {
      persist: { storage: createJSONStorage(() => AsyncStorage) },
    })

    // FIXME: Fix act issue:
    // Warning: An update to PersistGate inside a test was not wrapped in act(...).
    const { container } = render(
      <PersistGate stores={[store]} loader={loader}>
        <div>
          <span>My App</span>
        </div>
      </PersistGate>
    )

    expect(container).toMatchSnapshot()
    expect(loader).toHaveBeenCalled()
    await sleep(250)

    expect(store.getState().data).toEqual(rehydratedData)

    expect.assertions(3)
  })
})
