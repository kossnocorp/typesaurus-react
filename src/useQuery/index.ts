import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { CollectionGroup } from 'typesaurus/group'
import { query, Query } from 'typesaurus/query'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useQuery<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[] | undefined
): TypesaurusHookResult<
  typeof queries extends undefined ? undefined : Doc<Model>[] | undefined
> {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), JSON.stringify(queries)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (queries) query(collection, queries).then(setResult).catch(setError)
  }, deps)

  return [result, { loading, error }]
}
