import { produce } from 'immer'
import { create } from 'zustand'

import { validateCreateStore } from '../internals/validations'
import createMiddlewares from '../internals/middlewares/create-middlewares'

import type {
  StoreType,
  CreateStoreType,
  CreateStoreConfigType,
  CreateStoreOptionsType,
} from '../types'

/**
 * Function that creates and returns a zustand store.
 * @param storeName - Name of the store.
 * @param data - Initial data of the store.
 * @param options - Optional. Config to use for store setup.
 */
export default function <StoreDataType>(
  storeName: string,
  data: StoreDataType,
  options?: CreateStoreOptionsType<StoreDataType>
): CreateStoreType<StoreDataType> {
  validateCreateStore<StoreDataType>({
    storeName,
    data,
    options,
  })

  const applyMiddlewares = createMiddlewares(storeName, options) as (
    n: string,
    s: CreateStoreConfigType<StoreDataType>
  ) => CreateStoreConfigType<StoreDataType>

  const zustandStore = create<StoreType<StoreDataType>>(
    applyMiddlewares(storeName, (set: any) => ({
      data,
      name: storeName,
      update: (producer: (data: StoreDataType) => void): void =>
        set(
          produce((currentStore: StoreType<StoreDataType>) => {
            producer(currentStore.data)
          })
        ),
      reset: (): void => set({ data }),
    }))
  )

  // Create a wrapper hook that transforms the selector to receive data directly
  const wrappedHook = ((selector?: any, equalityFn?: any) => {
    if (selector === undefined) {
      return zustandStore()
    }
    // Transform the selector to access the data property
    if (equalityFn !== undefined) {
      return (zustandStore as any)(
        (state: StoreType<StoreDataType>) => selector(state.data),
        equalityFn
      )
    }
    return (zustandStore as any)((state: StoreType<StoreDataType>) =>
      selector(state.data)
    )
  }) as CreateStoreType<StoreDataType>

  // Copy over all the Zustand store methods and properties
  wrappedHook.getState = zustandStore.getState
  wrappedHook.setState = zustandStore.setState as any
  wrappedHook.subscribe = zustandStore.subscribe

  // Copy persist methods if they exist
  if ((zustandStore as any).persist) {
    wrappedHook.persist = (zustandStore as any).persist
  }

  // Copy subscribeWithSelector methods if they exist
  if ((zustandStore as any).subscribeWithSelector) {
    wrappedHook.subscribeWithSelector = (
      zustandStore as any
    ).subscribeWithSelector
  }

  return wrappedHook
}
