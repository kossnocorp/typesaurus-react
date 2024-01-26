import type { TypesaurusUtils } from "typesaurus";

export namespace TypesaurusReact {
  export type HookInput<Type> = Type | TypesaurusUtils.Falsy;

  export type HookResult<Result, ExtraMeta = {}> = [
    result: Result,
    meta: { loading: boolean; error: unknown } & ExtraMeta,
  ];

  export type HookLazyUse<Result, ExtraMeta = {}> = () => HookResult<
    Result,
    ExtraMeta
  >;
}
