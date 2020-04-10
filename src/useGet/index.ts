import { useEffect, useState } from '../adaptor'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import get from 'typesaurus/get'

export default function useGet<Model>(
  collection: Collection<Model>,
  id: string | undefined
): typeof id extends undefined ? undefined : Doc<Model> | null | undefined {
  const [result, setResult] = useState<Doc<Model> | null | undefined>(undefined)

  const deps = [JSON.stringify(collection), id]
  useEffect(() => {
    if (result) setResult(undefined)
    if (id) get(collection, id).then(setResult)
  }, deps)

  return result
}
