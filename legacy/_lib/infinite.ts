import { FirestoreOrderByDirection } from 'typesaurus/adaptor'

export type InfiniteLoadMoreFunction = () => void

export type InfiniteLoadMoreState = InfiniteLoadMoreFunction | undefined | null

export type InfiniteQueryOptions<Field> = {
  field: Field
  limit: number
  method?: FirestoreOrderByDirection
}

export type InfiniteCursorsState = {
  [cursorId: string]: 'loading' | 'loaded'
}

export type InfiniteQueryHookResultMeta = {
  loadMore: InfiniteLoadMoreState
  loadedAll: boolean
}
