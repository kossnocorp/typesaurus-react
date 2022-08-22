import { Typesaurus } from 'typesaurus/types/core'
import { useEffect, useState } from '../adaptor'
import { TypesaurusReact } from '../types'

export function useQuery<Request extends Typesaurus.Request<any>, Result>(
  query: TypesaurusReact.HookInput<
    | Typesaurus.SubscriptionPromise<Request, Result>
    | Typesaurus.SubscriptionPromiseOn<Request, Result>
  >
): TypesaurusReact.HookResult<Result | undefined> {
  const [result, setResult] = useState<Result | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const loading = result === undefined && !error

  useEffect(() => {
    // The request is not ready yet
    if (!query) return

    // The result is defined, hence the request has changed
    if (result) setResult(undefined)

    if (typeof query === 'function') {
      return query(setResult).catch(setError)
    } else {
      query.then(setResult).catch(setError)
    }
  }, [!!query, query && JSON.stringify(query.request)])

  return [result, { loading, error }]
}
