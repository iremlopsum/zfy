import React from 'react'
import { createJSONStorage } from 'zustand/middleware'
import { render, waitFor } from '@testing-library/react'

import PersistGate from '../core/PersistGate'
import createStore from '../core/create-store'
import { data, SyncStorage, AsyncStorage, rehydratedData } from '.'

describe('🚪 Core > PersistGate:', () => {
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
