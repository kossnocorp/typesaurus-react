import { useEffect, useState } from '../adaptor'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import onGet from 'typesaurus/onGet'

export default function useOnGet<Model>(
  collection: Collection<Model>,
  id: string | undefined
): typeof id extends undefined ? undefined : Doc<Model> | null | undefined {
  const [result, setResult] = useState<Doc<Model> | null | undefined>(undefined)

  const deps = [JSON.stringify(collection), id]
  useEffect(() => {
    if (result) setResult(undefined)
    if (id) return onGet(collection, id, setResult)
  }, deps)

  return result
}
