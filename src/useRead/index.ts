import type { TypesaurusCore } from "typesaurus";
import { useEffect, useState, useMemo } from "../adapter/index.js";
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
    // Use ignore flag to prevent setting state after the hook is unmounted
    let ignore = false;

    // Reset the state since the query has changed
    setResult(undefined);
    setError(undefined);

    // The request is not ready yet
    if (!query) return;

    if (typeof query === "function") {
      // It's a update subscription function, so we call it
      const off = query(((newResult: Result) => {
        if (ignore) return;
        setResult(newResult);
      }) as TypesaurusCore.SubscriptionPromiseCallback<
        Result,
        SubscriptionMeta
      >).catch((newError) => {
        if (ignore) return;
        setError(newError);
      });
      return () => {
        ignore = true;
        off();
      };
    } else {
      // It's a promise, so we await it
      query
        .then((newResult) => {
          if (ignore) return;
          setResult(newResult);
        })
        .catch((newError) => {
          if (ignore) return;
          setError(newError);
        });
      return () => {
        ignore = true;
      };
    }
    // TODO: Come up with a better way to serialize and identify request
  }, [query && JSON.stringify(query.request), setResult, setError]);

  const status = useMemo(
    () => ({ loading: result === undefined && !error, error }),
    [result, error],
  );

  const tuple = useMemo(() => [result, status] as const, [result, status]);

  return tuple;
}
