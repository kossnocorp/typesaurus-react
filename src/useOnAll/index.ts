import { ServerTimestampsStrategy } from 'typesaurus/adaptor/types'
import { Collection } from 'typesaurus/collection'
import { AnyDoc, DocOptions } from 'typesaurus/doc'
import onAll from 'typesaurus/onAll'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useOnAll<
  Model,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  options?: DocOptions<ServerTimestamps>
): TypesaurusHookResult<
  AnyDoc<Model, boolean, ServerTimestamps>[] | undefined
> {
  const [result, setResult] = useState<
    AnyDoc<Model, boolean, ServerTimestamps>[] | undefined
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
