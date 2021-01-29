import { ServerTimestampsStrategy } from 'typesaurus/adaptor/types'
import { Collection } from 'typesaurus/collection'
import { Doc, DocOptions } from 'typesaurus/doc'
import onGetMany from 'typesaurus/onGetMany'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useOnGetMany<
  Model,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  ids: readonly string[] | undefined,
  options?: DocOptions<ServerTimestamps>
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
