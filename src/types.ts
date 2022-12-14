import type { TypesaurusUtils as Utils } from 'typesaurus/types/utils'

export namespace TypesaurusReact {
  export type HookInput<Type> = Type | Utils.Falsy

  export type HookResult<Result, ExtraMeta = {}> = [
    result: Result,
    meta: { loading: boolean; error: unknown } & ExtraMeta
  ]
}
