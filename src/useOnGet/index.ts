import { useEffect, useState } from '../adaptor'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import onGet from 'typesaurus/onGet'
import { TypesaurusHookResult } from '../types'

export default function useOnGet<Model>(
  collection: Collection<Model>,
  id: string | undefined
): TypesaurusHookResult<
  typeof id extends undefined ? undefined : Doc<Model> | null | undefined
> {
  const [result, setResult] = useState<Doc<Model> | null | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined

  const deps = [JSON.stringify(collection), id]
  useEffect(() => {
    if (result) setResult(undefined)
    if (id) return onGet(collection, id, setResult, setError)
  }, deps)

  return [result, { loading, error }]
}
