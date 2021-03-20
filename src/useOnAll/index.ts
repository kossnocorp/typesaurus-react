import { Collection } from 'typesaurus/collection'
import { AnyDoc } from 'typesaurus/doc'
import { onAll, OnAllOptions } from 'typesaurus/onAll'
import { RuntimeEnvironment, ServerTimestampsStrategy } from 'typesaurus/types'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useOnAll<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  options?: OnAllOptions<Environment, ServerTimestamps>
): TypesaurusHookResult<
  AnyDoc<Model, Environment, boolean, ServerTimestamps>[] | undefined
> {
  const [result, setResult] = useState<
    AnyDoc<Model, Environment, boolean, ServerTimestamps>[] | undefined
  >(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection)]
  useEffect(() => {
    if (result) setResult(undefined)
    return onAll(collection, setResult, setError, options)
  }, deps)

  return [result, { loading, error }]
}
