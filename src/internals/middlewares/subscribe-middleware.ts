import type {
  StoreType,
  CreateStoreConfigType,
  CreateStoreOptionsType,
} from '../../types'

// Custom types for middleware
type StateListener<T> = (state: T, prevState: T) => void
type StateSelector<T, U> = (state: T) => U
type StateSliceListener<T> = (slice: T, previousSlice: T) => void

// NOTE: Adapted from https://github.com/pmndrs/zustand/blob/main/src/middleware/subscribeWithSelector.ts.
const middleware =
  <StoreDataType>(
    _: string,
    config: CreateStoreConfigType<StoreDataType>,
    __?: CreateStoreOptionsType<StoreDataType>
  ): CreateStoreConfigType<StoreDataType> =>
  (set, get, api): StoreType<StoreDataType> => {
    const deprecatedSubscribe = api.subscribe

    const apiWithSubscribeWithSelector = api as typeof api & {
      subscribeWithSelector: <StateSlice>(
        selector: StateSelector<StoreType<StoreDataType>, StateSlice>,
        providedListener: StateSliceListener<StateSlice>,
        options?:
          | {
              equalityFn?: (a: StateSlice, b: StateSlice) => boolean
              fireImmediately?: boolean
            }
          | undefined
      ) => () => void
    }

    apiWithSubscribeWithSelector.subscribeWithSelector = <StateSlice>(
      selector: StateSelector<StoreType<StoreDataType>, StateSlice>,
      providedListener: StateSliceListener<StateSlice>,
      options?:
        | {
            equalityFn?: (a: StateSlice, b: StateSlice) => boolean
            fireImmediately?: boolean
          }
        | undefined
    ) => {
      let listener: StateListener<StoreType<StoreDataType>> = (
        state: StoreType<StoreDataType>
      ) => selector(state) as any

      if (providedListener) {
        const equalityFn = options?.equalityFn || Object.is
        let currentSlice = selector(apiWithSubscribeWithSelector.getState())

        listener = (state: StoreType<StoreDataType>) => {
          const nextSlice = selector(state)
          if (!equalityFn(currentSlice, nextSlice)) {
            const previousSlice = currentSlice
            providedListener((currentSlice = nextSlice), previousSlice)
          }
        }

        if (options?.fireImmediately) {
          providedListener(currentSlice, currentSlice)
        }
      }

      return deprecatedSubscribe(listener)
    }

    return config(set, get, apiWithSubscribeWithSelector as any)
  }

export default middleware
