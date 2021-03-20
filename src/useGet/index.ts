import type { Ref } from 'typesaurus/ref'
import type { Collection } from 'typesaurus/collection'
import type { AnyDoc, Doc } from 'typesaurus/doc'
import { get, GetOptions } from 'typesaurus/get'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'
import { RuntimeEnvironment, ServerTimestampsStrategy } from 'typesaurus/types'

/**
 * @param ref - The reference to the document
 */
export default function useGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  ref: Ref<Model> | undefined,
  options?: GetOptions<Environment, ServerTimestamps>
): TypesaurusHookResult<
  typeof ref extends undefined
    ? undefined
    : AnyDoc<Model, Environment, boolean, ServerTimestamps> | null | undefined
>

/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
export default function useGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  id: string | undefined,
  options?: GetOptions<Environment, ServerTimestamps>
): TypesaurusHookResult<
  typeof id extends undefined
    ? undefined
    : AnyDoc<Model, Environment, boolean, ServerTimestamps> | null | undefined
>

export default function useGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collectionOrRef: Collection<Model> | Ref<Model> | undefined,
  maybeIdOrOptions?: string | GetOptions<Environment, ServerTimestamps>,
  maybeOptions?: GetOptions<Environment, ServerTimestamps>
) {
  let collection: Collection<Model> | undefined
  let id: string | undefined
  let options: GetOptions<Environment, ServerTimestamps> | undefined

  if (collectionOrRef && collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = maybeIdOrOptions as string | undefined
    options = maybeOptions
  } else {
    const ref = collectionOrRef as Ref<Model> | undefined
    collection = ref?.collection
    id = ref?.id
    options = maybeIdOrOptions as
      | GetOptions<Environment, ServerTimestamps>
      | undefined
  }

  const [result, setResult] = useState<Doc<Model> | null | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), id]
  useEffect(() => {
    if (result) setResult(undefined)
    if (collection && id)
      get(collection, id, options).then(setResult).catch(setError)
  }, deps)

  return [result, { loading, error }]
}
