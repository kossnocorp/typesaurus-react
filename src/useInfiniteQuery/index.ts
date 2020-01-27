import { useEffect, useState } from '../adaptor/react'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { CollectionGroup } from 'typesaurus/group'
import { query, Query } from 'typesaurus/query'
import { useRef } from 'react'
import { order } from 'typesaurus/order'
import { startAfter } from 'typesaurus/cursor'
import { limit } from 'typesaurus/limit'
import {
  InfiniteQueryOptions,
  InfiniteLoadMoreState,
  InfiniteCursorsState
} from '../_lib/infinite'

export default function useInfiniteQuery<Model, FieldName extends keyof Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[],
  options: InfiniteQueryOptions<FieldName>
): typeof queries extends undefined
  ? [undefined, undefined]
  : [Doc<Model>[] | undefined, InfiniteLoadMoreState] {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [cursor, setCursor] = useState<Doc<Model> | undefined>(undefined)
  const [loadedAll, setLoadedAll] = useState(false)
  const cursorsMap = useRef<InfiniteCursorsState>({})
  const cursorId = cursor?.ref.id || 'initial'

  const deps = [JSON.stringify(collection), JSON.stringify(queries), cursorId]
  useEffect(() => {
    if (queries) {
      if (cursorsMap.current[cursorId] === undefined) {
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
        ).then(newResult => {
          cursorsMap.current[cursorId] = 'loaded'
          if (newResult.length === 0 || newResult.length < options.limit)
            setLoadedAll(true)
          setResult((result || []).concat(newResult))
        })
      }
    } else if (result) {
      setResult(undefined)
    }
  }, deps)

  const loadMore = loadedAll
    ? null
    : result && cursorsMap.current[cursorId] === 'loaded'
    ? () => {
        setCursor(result[result.length - 1])
      }
    : undefined

  return [result, loadMore]
}
