import type { TypesaurusCore } from 'typesaurus/types/core'
import { useEffect, useState } from '../adaptor/react'
import type { TypesaurusReact } from '../types'

export function useRead<
  Request extends TypesaurusCore.Request<any>,
  Result,
  SubscriptionMeta = undefined
>(
  query: TypesaurusReact.HookInput<
    | TypesaurusCore.SubscriptionPromise<Request, Result, SubscriptionMeta>
    | TypesaurusCore.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>
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
      return query(
        // TODO: Find a way to satisfy TypeScript here and get rid of the ass:
        setResult as TypesaurusCore.SubscriptionPromiseCallback<
          Result,
          SubscriptionMeta
        >
      ).catch(setError)
    } else {
      query.then(setResult).catch(setError)
    }
  }, [!!query, query && JSON.stringify(query.request)])

  return [result, { loading, error }]
}
