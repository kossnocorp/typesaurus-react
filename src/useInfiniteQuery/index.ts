import { Collection } from 'typesaurus/collection'
import { startAfter } from 'typesaurus/cursor'
import { Doc } from 'typesaurus/doc'
import { CollectionGroup } from 'typesaurus/group'
import { limit } from 'typesaurus/limit'
import { order } from 'typesaurus/order'
import { query, Query } from 'typesaurus/query'
import { useEffect, useRef, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'
import {
  InfiniteCursorsState,
  InfiniteLoadMoreState,
  InfiniteQueryOptions
} from '../_lib/infinite'

export default function useInfiniteQuery<Model, FieldName extends keyof Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[] | undefined,
  options: InfiniteQueryOptions<FieldName>
): TypesaurusHookResult<
  typeof queries extends undefined ? undefined : Doc<Model>[],
  {
    loadMore: typeof queries extends undefined
      ? undefined
      : InfiniteLoadMoreState
  }
> {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const [cursor, setCursor] = useState<Doc<Model> | undefined>(undefined)
  const [loadedAll, setLoadedAll] = useState(false)
  const cursorsMap = useRef<InfiniteCursorsState>({})
  const cursorId = cursor?.ref.id || 'initial'
  const loading = result === undefined

  const sharedDeps = [JSON.stringify(collection), JSON.stringify(queries)]

  useEffect(() => {
    if (result) setResult(undefined)
  }, sharedDeps)

  const deps = sharedDeps.concat(cursorId)
  useEffect(() => {
    if (queries && cursorsMap.current[cursorId] === undefined) {
      cursorsMap.current[cursorId] = 'loading'
      query(
        collection,
        queries.concat([
          order(
            options.field,
            options.method || 'asc',
            cursor ? [startAfter(cursor)] : []
          ),
          limit(options.limit)
        ])
      )
        .then(newResult => {
          cursorsMap.current[cursorId] = 'loaded'
          if (newResult.length === 0 || newResult.length < options.limit)
            setLoadedAll(true)
          setResult((result || []).concat(newResult))
        })
        .catch(setError)
    }
  }, deps)

  const loadMore = loadedAll
    ? null
    : result && cursorsMap.current[cursorId] === 'loaded'
    ? () => {
        setCursor(result[result.length - 1])
      }
    : undefined

  return [result, { loading, error, loadMore }]
}
