import { useEffect, useState } from '../adaptor'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { CollectionGroup } from 'typesaurus/group'
import onQuery, { Query } from 'typesaurus/onQuery'

export default function useOnQuery<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[] | undefined
): typeof queries extends undefined ? undefined : Doc<Model>[] | undefined {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)

  const deps = [JSON.stringify(collection), JSON.stringify(queries)]
  useEffect(() => {
    if (result) setResult(undefined)
    if (queries) return onQuery(collection, queries, setResult)
  }, deps)

  return result
}
