import * as testing from '@firebase/testing'
import { act, renderHook } from '@testing-library/react-hooks'
import assert from 'assert'
import { nanoid } from 'nanoid'
import {
  add,
  Collection,
  collection,
  limit,
  Query,
  Ref,
  ref,
  set,
  update,
  where
} from 'typesaurus'
import { setApp } from 'typesaurus/testing'
import useOnQuery from '.'
import { lockDB } from '../../test/_lib/utils'

describe('useOnQuery', () => {
  type Contact = { ownerId: string; name: string; year: number; birthday: Date }
  type Message = { ownerId: string; author: Ref<Contact>; text: string }

  const contacts = collection<Contact>('contacts')
  const messages = collection<Message>('messages')

  const ownerId = nanoid()
  const leshaId = `lesha-${ownerId}`
  const sashaId = `sasha-${ownerId}`
  const tatiId = `tati-${ownerId}`

  beforeAll(async () => {
    setApp(testing.initializeAdminApp({ projectId: 'project-id' }))

    Promise.all([
      set(contacts, leshaId, {
        ownerId,
        name: 'Lesha',
        year: 1995,
        birthday: new Date(1995, 6, 2)
      }),
      set(contacts, tatiId, {
        ownerId,
        name: 'Tati',
        year: 1989,
        birthday: new Date(1989, 6, 10)
      }),
      add(messages, { ownerId, author: ref(contacts, sashaId), text: '+1' }),
      add(messages, { ownerId, author: ref(contacts, leshaId), text: '+1' }),
      add(messages, { ownerId, author: ref(contacts, tatiId), text: 'wut' }),
      add(messages, { ownerId, author: ref(contacts, sashaId), text: 'lul' })
    ])
  })

  beforeEach(async () => {
    await set(contacts, sashaId, {
      ownerId,
      name: 'Sasha',
      year: 1987,
      birthday: new Date(1987, 1, 11)
    })
  })

  it('queries documents', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useOnQuery(contacts, [where('ownerId', '==', ownerId)])
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    const [docs] = result.current
    assert.deepEqual(docs!.map(({ data: { name } }) => name).sort(), [
      'Lesha',
      'Sasha',
      'Tati'
    ])
  })

  it('subscribes to real-time updates', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useOnQuery(contacts, [where('ownerId', '==', ownerId)])
    )
    await waitForNextUpdate()
    await act(() => update(contacts, sashaId, { name: 'Саша' }))
    assert.deepEqual(
      result.current[0]!.map(({ data: { name } }) => name).sort(),
      ['Lesha', 'Tati', 'Саша']
    )
  })

  it('cleans the data and refetch when the collection is changing', async () => {
    const initialProps: { collection: Collection<any> } = {
      collection: contacts
    }
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ collection }) =>
        useOnQuery(collection, [where('ownerId', '==', ownerId)]),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0])
    rerender({ collection: messages })
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(typeof result.current[0]![0].data.text === 'string')
  })

  it('cleans the data and refetch when the queries are changing', async () => {
    const initialProps: {
      queries: Query<Contact, keyof Contact>[]
    } = { queries: [where('ownerId', '==', ownerId)] }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ queries }) => useOnQuery(contacts, queries),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0])
    rerender({ queries: [where('name', '==', 'Sasha'), limit(1)] })
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]!.length === 1)
    assert(result.current[0]![0].data.name === 'Sasha')
  })

  it('when the queries is undefined the hook waits for it', async () => {
    const initialProps: {
      queries: Query<Contact, keyof Contact>[] | undefined
    } = { queries: undefined }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ queries }) => useOnQuery(contacts, queries),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    assert(result.current[1].loading)
    rerender({ queries: [where('ownerId', '==', ownerId)] })
    await waitForNextUpdate()
    const [docs] = result.current
    assert.deepEqual(docs!.map(({ data: { name } }) => name).sort(), [
      'Lesha',
      'Sasha',
      'Tati'
    ])
  })

  it('returns loading state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useOnQuery(contacts, [where('ownerId', '==', ownerId)])
    )
    assert(result.current[1].loading)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
  })

  it('returns error state', async () => {
    await lockDB()
    const { result, waitForNextUpdate } = renderHook(() =>
      useOnQuery(contacts, [where('ownerId', '==', ownerId)])
    )
    assert(result.current[1].loading)
    assert(!result.current[1].error)
    await waitForNextUpdate()
    assert(!result.current[1].loading)

    assert(result.current[1].error)
  })
})
