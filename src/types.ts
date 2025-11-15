import type { StoreApi, StateCreator, StoreMutatorIdentifier } from 'zustand'
import type { UseBoundStore } from 'zustand/react'
import type { PersistOptions } from 'zustand/middleware'

// Custom types for compatibility
export type EqualityChecker<T> = (a: T, b: T) => boolean

export interface StoreType<StoreDataType> {
  name: string
  data: StoreDataType
  reset: () => void
  update: (producer: (data: StoreDataType) => void) => void
}

export type CreateStoreType<StoreDataType> = UseBoundStore<
  StoreApi<StoreType<StoreDataType>>
> & {
  persist?: {
    setOptions: (
      options: Partial<PersistOptions<StoreType<StoreDataType>>>
    ) => void
    clearStorage: () => void
    rehydrate: () => Promise<void> | void
    hasHydrated: () => boolean
    onHydrate: (fn: (state: StoreType<StoreDataType>) => void) => () => void
    onFinishHydration: (
      fn: (state: StoreType<StoreDataType>) => void
    ) => () => void
  }
  subscribeWithSelector?: {
    (
      listener: (
        selectedState: StoreType<StoreDataType>,
        previousSelectedState: StoreType<StoreDataType>
      ) => void
    ): () => void
    <U>(
      selector: (state: StoreType<StoreDataType>) => U,
      listener: (selectedState: U, previousSelectedState: U) => void,
      options?: {
        equalityFn?: (a: U, b: U) => boolean
        fireImmediately?: boolean
      }
    ): () => void
  }
}

export type CreateStoreConfigType<
  StoreDataType,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = []
> = StateCreator<StoreType<StoreDataType>, Mis, Mos>

export interface CreateStoreOptionsType<StoreDataType> {
  log?: boolean
  subscribe?: boolean
  persist?: Omit<PersistOptions<StoreType<StoreDataType>>, 'name'> & {
    name?: string
    storage: PersistOptions<StoreType<StoreDataType>>['storage']
  }
  customMiddlewares?: ZfyMiddlewareType<StoreDataType>[]
}

export type ZfyMiddlewareType<StoreDataType> = (
  storeName: string,
  config: CreateStoreConfigType<StoreDataType>,
  options?: CreateStoreOptionsType<StoreDataType>
) => CreateStoreConfigType<StoreDataType>

export type InitStoresResetOptionsType<StoreDataType> = {
  omit?: Array<keyof StoreDataType>
}

export type InitStoresType<StoresDataType> = {
  stores: {
    [StoreNameType in keyof StoresDataType]: CreateStoreType<
      StoresDataType[StoreNameType]
    >
  } & {
    rehydrate: () => Promise<boolean>
    reset: (options?: InitStoresResetOptionsType<StoresDataType>) => void
  }
  useStores: <StoreNameType extends keyof StoresDataType, Output>(
    storeName: StoreNameType,
    selector: (data: StoresDataType[StoreNameType]) => Output,
    equalityFn?: EqualityChecker<Output>
  ) => Output
}
