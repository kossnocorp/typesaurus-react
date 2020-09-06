import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import onAll from 'typesaurus/onAll'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useOnAll<Model>(
  collection: Collection<Model>
): TypesaurusHookResult<Doc<Model>[] | undefined> {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection)]
  useEffect(() => {
    if (result) setResult(undefined)
    return onAll(collection, setResult, setError)
  }, deps)

  return [result, { loading, error }]
}
