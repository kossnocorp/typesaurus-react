import * as testing from '@firebase/testing'
import { renderHook } from '@testing-library/react-hooks'
import assert from 'assert'
import { nanoid } from 'nanoid'
import { add, collection, Query, ref, set, where } from 'typesaurus'
import { setApp } from 'typesaurus/testing'
import useQuery from '.'
import { lockDB } from '../../test/_lib/utils'

describe('useQuery', () => {
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
      set(contacts, sashaId, {
        ownerId,
        name: 'Sasha',
        year: 1987,
        birthday: new Date(1987, 1, 11)
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

  it('queries documents', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useQuery(contacts, [where('ownerId', '==', ownerId)])
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

  it('when the queries is undefined the hook waits for it', async () => {
    const initialProps: {
      queries: Query<Contact, keyof Contact>[] | undefined
    } = { queries: undefined }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ queries }) => useQuery(contacts, queries),
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
      useQuery(contacts, [where('ownerId', '==', ownerId)])
    )
    assert(result.current[1].loading)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
  })

  it('returns error state', async () => {
    await lockDB()
    const { result, waitForNextUpdate } = renderHook(() =>
      useQuery(contacts, [where('ownerId', '==', ownerId)])
    )
    assert(result.current[1].loading)
    assert(!result.current[1].error)
    await waitForNextUpdate()
    assert(!result.current[1].loading)

    assert(result.current[1].error)
  })
})
