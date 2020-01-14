type EffectCallback = () => void | (() => void | undefined)
type DependencyList = ReadonlyArray<any>
let useEffect: (effect: EffectCallback, deps?: DependencyList) => void

type Dispatch<Action> = (value: Action) => void
type SetStateAction<State> = State | ((prevState: State) => State)
let useState: <State>(
  initialState: State | (() => State)
) => [State, Dispatch<SetStateAction<State>>]

try {
  const React = require('react')
  useEffect = React.useEffect
  useState = React.useState
} catch (_err) {
  try {
    const Hooks = require('preact/hooks')
    useEffect = Hooks.useEffect
    useState = Hooks.useState
  } catch (_err) {
    throw new Error(
      'Could find neither react nor preact package, please install one of those'
    )
  }
}

export { useEffect, useState }
