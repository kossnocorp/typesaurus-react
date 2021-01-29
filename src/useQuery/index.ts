import { ServerTimestampsStrategy } from 'typesaurus/adaptor/types'
import { Collection } from 'typesaurus/collection'
import { AnyDoc, DocOptions } from 'typesaurus/doc'
import { CollectionGroup } from 'typesaurus/group'
import { query, Query } from 'typesaurus/query'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useQuery<
  Model,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[] | undefined,
  options?: DocOptions<ServerTimestamps>
): TypesaurusHookResult<
  typeof queries extends undefined
    ? undefined
    : AnyDoc<Model, boolean, ServerTimestamps>[] | undefined
> {
  const [result, setResult] = useState<
    AnyDoc<Model, boolean, ServerTimestamps>[] | undefined
  >(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), JSON.stringify(queries)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (queries)
      query(collection, queries, options).then(setResult).catch(setError)
  }, deps)

  return [result, { loading, error }]
}
