import { Collection } from 'typesaurus/collection'
import { AnyDoc } from 'typesaurus/doc'
import { getMany, GetManyOptions } from 'typesaurus/getMany'
import { RuntimeEnvironment, ServerTimestampsStrategy } from 'typesaurus/types'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useGetMany<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  ids: readonly string[] | undefined,
  options?: GetManyOptions<Model, Environment, ServerTimestamps>
): TypesaurusHookResult<
  typeof ids extends undefined
    ? undefined
    : AnyDoc<Model, Environment, boolean, ServerTimestamps>[] | undefined
> {
  const [result, setResult] = useState<
    AnyDoc<Model, Environment, boolean, ServerTimestamps>[] | undefined
  >(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), JSON.stringify(ids)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (ids) getMany(collection, ids, options).then(setResult).catch(setError)
  }, deps)

  return [result, { loading, error }]
}
