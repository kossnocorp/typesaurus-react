import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { onGet, OnGetOptions } from 'typesaurus/onGet'
import { Ref } from 'typesaurus/ref'
import { RuntimeEnvironment, ServerTimestampsStrategy } from 'typesaurus/types'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

/**
 * @param ref - The reference to the document
 */
export default function useOnGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  ref: Ref<Model> | undefined,
  options?: OnGetOptions<Environment, ServerTimestamps>
): TypesaurusHookResult<
  typeof ref extends undefined ? undefined : Doc<Model> | null | undefined
>

/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
export default function useOnGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  id: string | undefined,
  options?: OnGetOptions<Environment, ServerTimestamps>
): TypesaurusHookResult<
  typeof id extends undefined ? undefined : Doc<Model> | null | undefined
>

export default function useOnGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collectionOrRef: Collection<Model> | Ref<Model> | undefined,
  maybeIdOrOptions?: string | OnGetOptions<Environment, ServerTimestamps>,
  maybeOptions?: OnGetOptions<Environment, ServerTimestamps>
) {
  let collection: Collection<Model> | undefined
  let id: string | undefined
  let options: OnGetOptions<Environment, ServerTimestamps> | undefined

  if (collectionOrRef && collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = maybeIdOrOptions as string | undefined
    options = maybeOptions
  } else {
    const ref = collectionOrRef as Ref<Model> | undefined
    collection = ref?.collection
    id = ref?.id
    options = maybeIdOrOptions as
      | OnGetOptions<Environment, ServerTimestamps>
      | undefined
  }

  const [result, setResult] = useState<Doc<Model> | null | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), id]
  useEffect(() => {
    if (result) setResult(undefined)
    if (collection && id)
      return onGet(collection, id, setResult, setError, options)
  }, deps)

  return [result, { loading, error }]
}
