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
  typeof queries extends undefined ? undefined : Doc<Model>[] | undefined,
  {
    loadMore: typeof queries extends undefined
      ? undefined
      : InfiniteLoadMoreState
  }
> {
  const collectionRef = useRef<
    Collection<Model> | CollectionGroup<Model> | undefined
  >(undefined)
  const queriesRef = useRef<Query<Model, keyof Model>[] | undefined>(undefined)
  const [refsChanged, setRefsChanged] = useState(0)
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const [cursor, setCursor] = useState<Doc<Model> | undefined>(undefined)
  const [loadedAll, setLoadedAll] = useState(false)
  const cursorsMap = useRef<InfiniteCursorsState>({})
  const cursorId = cursor?.ref.id || 'initial'
  const loading = result === undefined && !error

  const queryKey = JSON.stringify([collection, queries])
  const queryKeyFromRef = JSON.stringify([
    collectionRef.current,
    queriesRef.current
  ])

  // Reset valus when collection or queries change
  useEffect(() => {
    if (queryKey === queryKeyFromRef) return
    collectionRef.current = collection
    queriesRef.current = queries
    setRefsChanged(Date.now())
    setResult(undefined)
    setError(undefined)
    setCursor(undefined)
    setLoadedAll(false)
    cursorsMap.current = {}
  }, [queryKey, queryKeyFromRef])

  const deps = [refsChanged, queryKey, queryKeyFromRef, cursorId]
  useEffect(() => {
    let unmounted = false

    // Skip update if collection or queries are missing, update pending or
    // already processing.
    const propsUpdatePending = queryKey !== queryKeyFromRef
    const alreadyProcessing = cursorsMap.current[cursorId] !== undefined
    if (
      !collectionRef.current ||
      !queriesRef.current ||
      propsUpdatePending ||
      alreadyProcessing
    ) {
      return
    }

    cursorsMap.current[cursorId] = 'loading'
    // console.log('+++ requesting', queryKey)
    query(
      collectionRef.current,
      queriesRef.current.concat([
        order(
          options.field,
          options.method || 'asc',
          cursor ? [startAfter(cursor)] : []
        ),
        limit(options.limit)
      ])
    )
      .then(newResult => {
        if (unmounted) return
        cursorsMap.current[cursorId] = 'loaded'
        if (newResult.length === 0 || newResult.length < options.limit)
          setLoadedAll(true)
        // console.log('>>> got result')
        setResult((result || []).concat(newResult))
      })
      .catch(err => {
        if (unmounted) return
        setError(err)
      })

    return () => {
      unmounted = true
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
