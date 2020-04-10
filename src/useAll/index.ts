import all from 'typesaurus/all'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { useEffect, useState } from '../adaptor'

export default function useAll<Model>(
  collection: Collection<Model>
): Doc<Model>[] | undefined {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)

  const deps = [JSON.stringify(collection)]
  useEffect(() => {
    if (result) setResult(undefined)
    all(collection).then(setResult)
  }, deps)

  return result
}
