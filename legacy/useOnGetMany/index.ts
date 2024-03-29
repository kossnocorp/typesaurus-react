import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { OnGetOptions } from 'typesaurus/onGet'
import { onGetMany } from 'typesaurus/onGetMany'
import { RuntimeEnvironment, ServerTimestampsStrategy } from 'typesaurus/types'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useOnGetMany<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  ids: readonly string[] | undefined,
  options?: OnGetOptions<Environment, ServerTimestamps>
): TypesaurusHookResult<Doc<Model>[] | undefined> {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), JSON.stringify(ids)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (ids) return onGetMany(collection, ids, setResult, setError, options)
  }, deps)

  return [result, { loading, error }]
}
