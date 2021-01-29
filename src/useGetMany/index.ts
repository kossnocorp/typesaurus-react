import { ServerTimestampsStrategy } from 'typesaurus/adaptor/types'
import { Collection } from 'typesaurus/collection'
import { AnyDoc, DocOptions } from 'typesaurus/doc'
import getMany, { OnMissing } from 'typesaurus/getMany'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

export default function useGetMany<
  Model,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  ids: readonly string[] | undefined,
  // TODO: Import OnMissingOptions from next versions
  options: DocOptions<ServerTimestamps> & {
    onMissing?: OnMissing<Model>
  } = {}
): TypesaurusHookResult<
  typeof ids extends undefined
    ? undefined
    : AnyDoc<Model, boolean, ServerTimestamps>[] | undefined
> {
  const [result, setResult] = useState<
    AnyDoc<Model, boolean, ServerTimestamps>[] | undefined
  >(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), JSON.stringify(ids)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (ids) getMany(collection, ids, options).then(setResult).catch(setError)
  }, deps)

  return [result, { loading, error }]
}
