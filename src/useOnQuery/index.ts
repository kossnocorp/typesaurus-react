import { Query, RuntimeEnvironment, ServerTimestampsStrategy } from 'typesaurus'
import { Collection } from 'typesaurus/collection'
import { AnyDoc } from 'typesaurus/doc'
import { CollectionGroup } from 'typesaurus/group'
import { onQuery, OnQueryOptions } from 'typesaurus/onQuery'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useOnQuery<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[] | undefined,
  options?: OnQueryOptions<Environment, ServerTimestamps>
): TypesaurusHookResult<
  typeof queries extends undefined
    ? undefined
    : AnyDoc<Model, Environment, boolean, ServerTimestamps>[] | undefined
> {
  const [result, setResult] = useState<
    AnyDoc<Model, Environment, boolean, ServerTimestamps>[] | undefined
  >(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), JSON.stringify(queries)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (queries)
      return onQuery(collection, queries, setResult, setError, options)
  }, deps)

  return [result, { loading, error }]
}
