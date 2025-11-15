import { persist } from 'zustand/middleware'

import type { CreateStoreConfigType, CreateStoreOptionsType } from '../../types'

const middleware = <StoreDataType>(
  storeName: string,
  config: CreateStoreConfigType<StoreDataType>,
  options?: CreateStoreOptionsType<StoreDataType>
): CreateStoreConfigType<StoreDataType> => {
  const { name = storeName, ...rest } = options?.persist ?? {}

  return persist(config, {
    name,
    ...(rest ? rest : {}),
  }) as any
}

export default middleware
