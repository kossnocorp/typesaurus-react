import type { TypesaurusCore } from "typesaurus";
import { useEffect, useState, useMemo } from "../adapter/react.js";
import type { TypesaurusReact } from "../types.js";

export function useRead<
  Request extends TypesaurusCore.Request<any>,
  Result,
  SubscriptionMeta = undefined,
>(
  query: TypesaurusReact.HookInput<
    | TypesaurusCore.SubscriptionPromise<Request, Result, SubscriptionMeta>
    | TypesaurusCore.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>
  >,
): TypesaurusReact.HookResult<Result | undefined> {
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [error, setError] = useState<unknown>(undefined);

  useEffect(() => {
    // The result is defined, hence the request has changed
    if (result) setResult(undefined);

    // The request is not ready yet
    if (!query) return;

    if (typeof query === "function") {
      return query(
        setResult as TypesaurusCore.SubscriptionPromiseCallback<
          Result,
          SubscriptionMeta
        >,
      ).catch(setError);
    } else {
      query.then(setResult).catch(setError);
    }
    // TODO: Come up with a better way to serialize and identify request
  }, [!!query, query && JSON.stringify(query.request)]);

  const status = useMemo(
    () => ({ loading: result === undefined && !error, error }),
    [result, error],
  );

  const tuple = useMemo(() => [result, status] as const, [result, status]);

  return tuple;
}
