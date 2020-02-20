import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import onGetMany from 'typesaurus/onGetMany'
import { useEffect, useState } from '../adaptor'

export default function useOnGetMany<Model>(
  collection: Collection<Model>,
  ids: readonly string[] | undefined
): Doc<Model>[] | undefined {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)

  const deps = [JSON.stringify(collection), JSON.stringify(ids)]
  useEffect(() => {
    if (ids) {
      return onGetMany(collection, ids, setResult)
    } else if (result) {
      setResult(undefined)
    }
  }, deps)

  return result
}
