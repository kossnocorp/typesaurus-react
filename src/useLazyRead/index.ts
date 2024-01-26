import type { TypesaurusCore } from "typesaurus";
import { useState, useCallback } from "../adapter/react.js";
import type { TypesaurusReact } from "../types.js";
import { useRead } from "../index.js";

export function useLazyRead<
  Request extends TypesaurusCore.Request<any>,
  Result,
  SubscriptionMeta = undefined,
>(
  query: TypesaurusReact.HookInput<
    | TypesaurusCore.SubscriptionPromise<Request, Result, SubscriptionMeta>
    | TypesaurusCore.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>
  >,
): TypesaurusReact.HookLazyUse<Result | undefined> {
  const [evaluate, setEvaluate] = useState(false);
  const result = useRead(evaluate && query);
  const lazyEval = useCallback(() => {
    !evaluate && setEvaluate(true);
    return result;
  }, [evaluate, result]);
  return lazyEval;
}
