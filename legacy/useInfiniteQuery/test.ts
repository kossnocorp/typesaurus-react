import * as testing from '@firebase/testing'
import { act, renderHook } from '@testing-library/react-hooks'
import assert from 'assert'
import { nanoid } from 'nanoid'
import { Collection, collection, Query, set, where } from 'typesaurus'
import { setApp } from 'typesaurus/testing'
import useInfiniteQuery from '.'
import { lockDB } from '../../test/_lib/utils'

describe('useInfiniteQuery', () => {
  type Contact = { ownerId: string; name: string; year: number; birthday: Date }

  const contacts = collection<Contact>('contacts')
  const contactsAlt = collection<Contact>('contactsAlt')

  let ownerId: string

  beforeEach(async () => {
    ownerId = nanoid()
    const leshaId = `lesha-${ownerId}`
    const sashaId = `sasha-${ownerId}`
    const tatiId = `tati-${ownerId}`

    setApp(testing.initializeAdminApp({ projectId: 'project-id' }))

    await Promise.all([
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
      set(contactsAlt, sashaId, {
        ownerId,
        name: 'Sasha',
        year: 1987,
        birthday: new Date(1987, 1, 11)
      })
    ])
  })

  it('queries documents', async () => {
    const { result, waitFor } = renderHook(() =>
      useInfiniteQuery(contacts, [where('ownerId', '==', ownerId)], {
        field: 'birthday',
        method: 'desc',
        limit: 2
      })
    )
    assert(result.current[0] === undefined)
    await waitFor(() => !!result.current[0])
    assert.deepEqual(
      result.current[0]!.map(({ data: { name } }) => name),
      ['Lesha', 'Tati']
    )
  })

  it('allows to load more pages', async () => {
    const { result, waitFor, waitForNextUpdate } = renderHook(() =>
      useInfiniteQuery(contacts, [where('ownerId', '==', ownerId)], {
        field: 'birthday',
        method: 'desc',
        limit: 2
      })
    )
    await waitFor(() => !!result.current[0])
    assert.deepEqual(
      result.current[0]!.map(({ data: { name } }) => name),
      ['Lesha', 'Tati']
    )
    assert(!result.current[1].loadedAll)
    act(() => result.current[1].loadMore?.())
    await waitForNextUpdate()
    assert.deepEqual(
      result.current[0]!.map(({ data: { name } }) => name),
      ['Lesha', 'Tati', 'Sasha']
    )
    assert(result.current[1].loadMore === null)
    assert(result.current[1].loadedAll)
  })

  it('cleans the data and refetch when the collection is changing', async () => {
    const initialProps: { collection: Collection<any> } = {
      collection: contacts
    }
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ collection }) =>
        useInfiniteQuery(collection, [where('ownerId', '==', ownerId)], {
          field: 'birthday',
          method: 'desc',
          limit: 2
        }),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0])
    rerender({ collection: contactsAlt })
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]![0].data.name === 'Sasha')
  })

  it('cleans the data and refetch when the queries are changing', async () => {
    const initialProps: {
      queries: Query<Contact, keyof Contact>[]
    } = { queries: [where('ownerId', '==', ownerId)] }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ queries }) =>
        useInfiniteQuery(contacts, queries, {
          field: 'birthday',
          method: 'desc',
          limit: 2
        }),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]!.length === 2)
    rerender({
      queries: [where('ownerId', '==', ownerId), where('name', '==', 'Sasha')]
    })
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]!.length === 1)
    assert(result.current[0]![0].data.name === 'Sasha')
  })

  it('when the queries is undefined the hook waits for it', async () => {
    const initialProps: {
      queries: Query<Contact, keyof Contact>[] | undefined
    } = { queries: undefined }
    const { result, rerender, waitFor } = renderHook(
      ({ queries }) =>
        useInfiniteQuery(contacts, queries, {
          field: 'birthday',
          method: 'desc',
          limit: 2
        }),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    assert(result.current[1].loading)

    // For some reason, unless there's a timeout, the test becomes flaky.
    // I spent hours debugging the issue and have to give up.
    // The funny part that putting console.log also fixes the issue,
    // so good luck to anyone who would dare to debug this.
    await new Promise(resolve => setTimeout(resolve, 1))

    rerender({ queries: [where('ownerId', '==', ownerId)] })

    await waitFor(() => !result.current[1].loading)
    assert.deepEqual(
      result.current[0]!.map(({ data: { name } }) => name),
      ['Lesha', 'Tati']
    )
  })

  it('returns loading state', async () => {
    const { result, waitForValueToChange } = renderHook(() =>
      useInfiniteQuery(contacts, [where('ownerId', '==', ownerId)], {
        field: 'birthday',
        method: 'desc',
        limit: 2
      })
    )
    assert(result.current[1].loading)
    await waitForValueToChange(() => !result.current[1].loading)
  })

  it('returns error state', async () => {
    await lockDB()
    const { result, waitForValueToChange } = renderHook(() =>
      useInfiniteQuery(contacts, [where('ownerId', '==', ownerId)], {
        field: 'birthday',
        method: 'desc',
        limit: 2
      })
    )
    assert(result.current[1].loading)
    assert(!result.current[1].error)
    await waitForValueToChange(() => !result.current[1].loading)
    assert(result.current[1].error)
  })
})
