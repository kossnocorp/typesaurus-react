import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { CollectionGroup } from 'typesaurus/group'
import onQuery, { Query } from 'typesaurus/onQuery'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useOnQuery<Model>(
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
    if (queries) return onQuery(collection, queries, setResult, setError)
  }, deps)

  return [result, { loading, error }]
}
