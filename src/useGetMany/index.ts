import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import getMany from 'typesaurus/getMany'
import { useEffect, useState } from '../adaptor'

export default function useGetMany<Model>(
  collection: Collection<Model>,
  ids: readonly string[] | undefined,
  onMissing: ((id: string) => Model) | 'ignore' = id => {
    throw new Error(`Missing document with id ${id}`)
  }
): typeof ids extends undefined ? undefined : Doc<Model>[] | undefined {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)

  const deps = [JSON.stringify(collection), JSON.stringify(ids)]
  useEffect(() => {
    if (ids) {
      getMany(collection, ids, onMissing).then(setResult)
    } else if (result) {
      setResult(undefined)
    }
  }, deps)

  return result
}
