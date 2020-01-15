import all from 'typesaurus/all'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { useEffect, useState } from '../adaptor/react'

export default function useAll<Model>(
  collection: Collection<Model>
): Doc<Model>[] | undefined {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)

  const deps = [JSON.stringify(collection)]
  useEffect(() => {
    all(collection).then(setResult)
  }, deps)

  return result
}
