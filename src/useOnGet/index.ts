import { useEffect, useState } from '../adaptor'
import { Collection } from 'typesaurus/collection'
import { Doc, DocOptions } from 'typesaurus/doc'
import onGet from 'typesaurus/onGet'
import { TypesaurusHookResult } from '../types'
import { Ref } from 'typesaurus'
import { ServerTimestampsStrategy } from 'typesaurus/adaptor/types'

/**
 * @param ref - The reference to the document
 */
export default function useOnGet<
  Model,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  ref: Ref<Model> | undefined,
  options?: DocOptions<ServerTimestamps>
): TypesaurusHookResult<
  typeof ref extends undefined ? undefined : Doc<Model> | null | undefined
>

/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
export default function useOnGet<
  Model,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  id: string | undefined,
  options?: DocOptions<ServerTimestamps>
): TypesaurusHookResult<
  typeof id extends undefined ? undefined : Doc<Model> | null | undefined
>

export default function useOnGet<
  Model,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collectionOrRef: Collection<Model> | Ref<Model> | undefined,
  maybeIdOrOptions?: string | DocOptions<ServerTimestamps>,
  maybeOptions?: DocOptions<ServerTimestamps>
) {
  let collection: Collection<Model> | undefined
  let id: string | undefined
  let options: DocOptions<ServerTimestamps> | undefined

  if (collectionOrRef && collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = maybeIdOrOptions as string | undefined
    options = maybeOptions
  } else {
    const ref = collectionOrRef as Ref<Model> | undefined
    collection = ref?.collection
    id = ref?.id
    options = maybeIdOrOptions as DocOptions<ServerTimestamps> | undefined
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
