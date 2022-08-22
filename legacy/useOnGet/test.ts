import * as testing from '@firebase/testing'
import { act, renderHook } from '@testing-library/react-hooks'
import assert from 'assert'
import { add, Collection, collection, Ref, set } from 'typesaurus'
import { setApp } from 'typesaurus/testing'
import useOnGet from '.'
import { lockDB } from '../../test/_lib/utils'

describe('useOnGet', () => {
  type User = { name: string }
  const users = collection<User>('users')
  const altUsers = collection<User>('altUsers')

  beforeEach(async () => {
    setApp(testing.initializeAdminApp({ projectId: 'project-id' }))
  })

  it('returns the requested document', async () => {
    const user = await add(users, { name: 'Sasha' })
    const { result, waitForNextUpdate } = renderHook(() =>
      useOnGet(users, user.id)
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    const [doc] = result.current
    assert(doc!.data.name === 'Sasha')
  })

  it('subscribes to real-time updates', async () => {
    const user = await add(users, { name: 'Sasha' })
    const { result, waitForNextUpdate } = renderHook(() =>
      useOnGet(users, user.id)
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]!.data.name === 'Sasha')
    await act(() => set(users, user.id, { name: 'Alexander' }))
    assert(result.current[0]!.data.name === 'Alexander')
  })

  it('accepts refs', async () => {
    const user = await add(users, { name: 'Sasha' })
    const { result, waitForNextUpdate } = renderHook(() => useOnGet(user))
    await waitForNextUpdate()
    assert(result.current[0]!.data.name === 'Sasha')
  })

  it('returns null if the document is not found', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useOnGet(users, 'nope')
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0] === null)
  })

  it('cleans the data and refetch when the collection is changing', async () => {
    const user = await add(users, { name: 'Sasha' })
    await set(altUsers, user.id, { name: 'Alexander' })
    const initialProps: { collection: Collection<any> } = { collection: users }
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ collection }) => useOnGet(collection, user.id),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0])
    rerender({ collection: altUsers })
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]!.data.name === 'Alexander')
  })

  it('cleans the data and refetch when the id is changing', async () => {
    const [user, anotherUser] = await Promise.all([
      add(users, { name: 'Sasha' }),
      add(users, { name: 'Tati' })
    ])
    const initialProps: { id: string } = { id: user.id }
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ id }) => useOnGet(users, id),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0])
    rerender({ id: anotherUser.id })
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]!.data.name === 'Tati')
  })

  it('when the id is undefined the hook waits for it', async () => {
    const user = await add(users, { name: 'Sasha' })
    const initialProps: { id: string | undefined } = { id: undefined }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ id }) => useOnGet(users, id),
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
      ({ ref }) => useOnGet(ref),
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
      useOnGet(users, user.id)
    )
    assert(result.current[1].loading)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
  })

  it('returns error state', async () => {
    const user = await add(users, { name: 'Sasha' })
    await lockDB()
    const { result, waitForNextUpdate } = renderHook(() =>
      useOnGet(users, user.id)
    )
    assert(result.current[1].loading)
    assert(!result.current[1].error)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
    assert(result.current[1].error)
  })
})
