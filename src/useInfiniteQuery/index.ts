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
  InfiniteQueryHookResultMeta,
  InfiniteQueryOptions
} from '../_lib/infinite'

export default function useInfiniteQuery<Model, FieldName extends keyof Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[] | undefined,
  options: InfiniteQueryOptions<FieldName>
): TypesaurusHookResult<Doc<Model>[] | undefined, InfiniteQueryHookResultMeta> {
  // The props (collection and queries) might change, or in case of queries,
  // be undefined. When they change, all the result state must be reset.
  // When queries is undefined, any requests must be delayed.
  //
  // Since there are plenty of moving parts, these props sync via references
  // that update in an effect.

  // The props references.
  const collectionRef = useRef<
    Collection<Model> | CollectionGroup<Model> | undefined
  >(undefined)
  const queriesRef = useRef<Query<Model, keyof Model>[] | undefined>(undefined)
  // The state that updates when the props references change
  const [, setPropsRefsChanged] = useState(0)
  // The props keys to be used in effects.
  const queryKey = JSON.stringify([collection, queries])
  const queryKeyFromRef = JSON.stringify([
    collectionRef.current,
    queriesRef.current
  ])

  // The cursor state.
  //
  // The cursor used to define the currently loading collection chunk.
  // It updates when the next page is requested.
  const [cursor, setCursor] = useState<Doc<Model> | undefined>(undefined)
  // The current cursor id
  const cursorId = cursor?.ref.id || 'initial'
  // Defines the cursor state: never requested, loading or loaded.
  const cursorStatesRef = useRef<InfiniteCursorsState>({})
  const [, setCursorStatesChanged] = useState(-1)

  // The state exposed to the user
  //
  // The final result state.
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  // The error state.
  const [error, setError] = useState<unknown>(undefined)
  // True if the query is loaded till the very end.
  const [loadedAll, setLoadedAll] = useState(false)
  // True if there's a request currently loading or the initial query
  // wasn't requested.
  const cursorValues = Object.values(cursorStatesRef.current)
  const loading =
    (cursorValues.length === 0 || !!cursorValues.find(c => c === 'loading')) &&
    !error
  // The function used to trigger a request for the next page.
  const loadMore = loadedAll
    ? null
    : result && cursorStatesRef.current[cursorId] === 'loaded'
    ? () => setCursor(result[result.length - 1])
    : undefined

  // Sync the props references and reset the state when they change
  useEffect(() => {
    // Ignore if the props references are in sync
    if (queryKey === queryKeyFromRef) return

    // Sync the props references
    collectionRef.current = collection
    queriesRef.current = queries
    setPropsRefsChanged(Date.now())

    // Reset the cursors
    setCursor(undefined)
    cursorStatesRef.current = {}
    setCursorStatesChanged(Date.now())

    // Reset the exposed state
    setResult(undefined)
    setError(undefined)
    setLoadedAll(false)
  }, [queryKey, queryKeyFromRef])

  // Query the current cursor.
  useEffect(() => {
    // Skip update if the props references sync is pending, queries is missing,
    // or the cursor is already processing.
    const propsInSync = queryKey === queryKeyFromRef
    const alreadyProcessing = cursorStatesRef.current[cursorId] !== undefined

    if (
      !collectionRef.current ||
      !queriesRef.current ||
      !propsInSync ||
      alreadyProcessing
    )
      return

    // Maintain the mounted state and ignore results if unmounted.
    let unmounted = false

    // Mark the current cursor as loading
    cursorStatesRef.current[cursorId] = 'loading'
    setCursorStatesChanged(Date.now())

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

        // Mark the current cursor as loaded
        cursorStatesRef.current[cursorId] = 'loaded'
        setCursorStatesChanged(Date.now())

        // If the result is empty or less than the requested size,
        // then consider the query fully loaded
        if (newResult.length === 0 || newResult.length < options.limit)
          setLoadedAll(true)

        // Add the requested chunk to the result
        setResult((result || []).concat(newResult))
      })
      .catch(error => {
        if (unmounted) return
        setError(error)
      })

    return () => {
      unmounted = true
    }
  }, [queryKey, queryKeyFromRef, cursorId])

  return [result, { loading, loadedAll, error, loadMore }]
}
