export type TypesaurusHookResult<Result, ExtraMeta = {}> = [
  result: Result,
  meta: { loading: boolean; error: unknown } & ExtraMeta
]
