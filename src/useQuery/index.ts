import { useEffect, useState } from '../adaptor'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { CollectionGroup } from 'typesaurus/group'
import { query, Query } from 'typesaurus/query'

export default function useQuery<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[] | undefined
): typeof queries extends undefined ? undefined : Doc<Model>[] | undefined {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)

  const deps = [JSON.stringify(collection), JSON.stringify(queries)]
  useEffect(() => {
    if (queries) {
      query(collection, queries).then(setResult)
    } else if (result) {
      setResult(undefined)
    }
  }, deps)

  return result
}
