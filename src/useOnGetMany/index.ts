import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import onGetMany from 'typesaurus/onGetMany'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useOnGetMany<Model>(
  collection: Collection<Model>,
  ids: readonly string[] | undefined
): TypesaurusHookResult<Doc<Model>[] | undefined> {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), JSON.stringify(ids)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (ids) return onGetMany(collection, ids, setResult, setError)
  }, deps)

  return [result, { loading, error }]
}
