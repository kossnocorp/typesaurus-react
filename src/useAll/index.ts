import all from 'typesaurus/all'
import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import { useEffect, useState } from '../adaptor'
import { TypesaurusHookResult } from '../types'

/**
 * Returns all documents in a collection.
 *
 * ```ts
 * import { useAll } from '@typesaurus/react'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * function Users() {
 *   const [allUsers] = useAll(users)
 * }
 * all(users).then(allUsers => {
 *   console.log(allUsers.length)
 *   //=> 420
 *   console.log(allUsers[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(allUsers[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection to get all documents from
 * @returns A promise to all documents
 */
export default function useAll<Model>(
  collection: Collection<Model>
): TypesaurusHookResult<Doc<Model>[] | undefined> {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  const deps = [JSON.stringify(collection)]
  useEffect(() => {
    if (result) setResult(undefined)
    all(collection).then(setResult).catch(setError)
  }, deps)

  return [result, { loading, error }]
}
