import { useEffect, useState } from '../adaptor'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import onGet from 'typesaurus/onGet'
import { TypesaurusHookResult } from '../types'
import { Ref } from 'typesaurus'

/**
 * @param ref - The reference to the document
 */
export default function useOnGet<Model>(
  ref: Ref<Model> | undefined
): TypesaurusHookResult<
  typeof ref extends undefined ? undefined : Doc<Model> | null | undefined
>

/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
export default function useOnGet<Model>(
  collection: Collection<Model>,
  id: string | undefined
): TypesaurusHookResult<
  typeof id extends undefined ? undefined : Doc<Model> | null | undefined
>

export default function useOnGet<Model>(
  collectionOrRef: Collection<Model> | Ref<Model> | undefined,
  maybeId?: string | undefined
) {
  let collection: Collection<Model> | undefined
  let id: string | undefined

  if (collectionOrRef && collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = maybeId as string | undefined
  } else {
    const ref = collectionOrRef as Ref<Model> | undefined
    collection = ref?.collection
    id = ref?.id
  }

  const [result, setResult] = useState<Doc<Model> | null | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection), id]
  useEffect(() => {
    if (result) setResult(undefined)
    if (collection && id) return onGet(collection, id, setResult, setError)
  }, deps)

  return [result, { loading, error }]
}
