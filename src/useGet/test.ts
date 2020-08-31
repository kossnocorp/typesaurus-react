import * as testing from '@firebase/testing'
import { renderHook } from '@testing-library/react-hooks'
import assert from 'assert'
import { add, collection, Ref } from 'typesaurus'
import { setApp } from 'typesaurus/testing'
import useGet from '.'
import { lockDB } from '../../test/_lib/utils'

describe('useGet', () => {
  type User = { name: string }
  const users = collection<User>('users')

  beforeEach(async () => {
    setApp(testing.initializeAdminApp({ projectId: 'project-id' }))
  })

  it('returns the requested document', async () => {
    const user = await add(users, { name: 'Sasha' })
    const { result, waitForNextUpdate } = renderHook(() =>
      useGet(users, user.id)
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    const [doc] = result.current
    assert(doc!.data.name === 'Sasha')
  })

  it('accepts refs', async () => {
    const user = await add(users, { name: 'Sasha' })
    const { result, waitForNextUpdate } = renderHook(() => useGet(user))
    await waitForNextUpdate()
    assert(result.current[0]!.data.name === 'Sasha')
  })

  it('returns null if the document is not found', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGet(users, 'nope')
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0] === null)
  })

  it('when the id is undefined the hook waits for it', async () => {
    const user = await add(users, { name: 'Sasha' })
    const initialProps: { id: string | undefined } = { id: undefined }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ id }) => useGet(users, id),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    assert(result.current[1].loading)
    rerender({ id: user.id })
    await waitForNextUpdate()
    const [doc] = result.current
    assert(doc!.data.name === 'Sasha')
  })

  it('when the ref is undefined the hook waits for it', async () => {
    const user = await add(users, { name: 'Sasha' })
    const initialProps: { ref: Ref<User> | undefined } = { ref: undefined }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ ref }) => useGet(ref),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    assert(result.current[1].loading)
    rerender({ ref: user })
    await waitForNextUpdate()
    const [doc] = result.current
    assert(doc!.data.name === 'Sasha')
  })

  it('returns loading state', async () => {
    const user = await add(users, { name: 'Sasha' })
    const { result, waitForNextUpdate } = renderHook(() =>
      useGet(users, user.id)
    )
    assert(result.current[1].loading)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
  })

  it('returns error state', async () => {
    const user = await add(users, { name: 'Sasha' })
    await lockDB()
    const { result, waitForNextUpdate } = renderHook(() =>
      useGet(users, user.id)
    )
    assert(result.current[1].loading)
    assert(!result.current[1].error)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
    assert(result.current[1].error)
  })
})
