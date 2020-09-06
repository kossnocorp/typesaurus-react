import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import getMany from 'typesaurus/getMany'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useGetMany<Model>(
  collection: Collection<Model>,
  ids: readonly string[] | undefined,
  // TODO: Import type from typesaurus
  onMissing: ((id: string) => Model) | 'ignore' = id => {
    throw new Error(`Missing document with id ${id}`)
  }
): TypesaurusHookResult<
  typeof ids extends undefined ? undefined : Doc<Model>[] | undefined
> {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), JSON.stringify(ids)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (ids) getMany(collection, ids, onMissing).then(setResult).catch(setError)
  }, deps)

  return [result, { loading, error }]
}
