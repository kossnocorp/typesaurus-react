export namespace TypesaurusReact {
  export type HookInput<Type> = Type | undefined | null | false

  export type HookResult<Result, ExtraMeta = {}> = [
    result: Result,
    meta: { loading: boolean; error: unknown } & ExtraMeta
  ]
}
