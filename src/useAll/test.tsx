import * as testing from '@firebase/testing'
import { renderHook } from '@testing-library/react-hooks'
import assert from 'assert'
import { collection, remove, set } from 'typesaurus'
import { setApp } from 'typesaurus/testing'
import useAll from '.'
import { lockDB } from '../../test/_lib/utils'

describe('useAll', () => {
  type Book = { title: string }
  const books = collection<Book>('books')

  beforeEach(async () => {
    setApp(testing.initializeAdminApp({ projectId: 'project-id' }))

    await Promise.all([
      set(books, 'sapiens', { title: 'Sapiens' }),
      set(books, '22laws', { title: 'The 22 Immutable Laws of Marketing' }),
      set(books, 'momtest', { title: 'The Mom Test' }),
      remove(books, 'hp1'),
      remove(books, 'hp2')
    ])
  })

  it('returns all documents', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAll(books))
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    const [docs] = result.current
    assert.deepEqual(docs!.map(({ data: { title } }) => title).sort(), [
      'Sapiens',
      'The 22 Immutable Laws of Marketing',
      'The Mom Test'
    ])
  })

  it('returns an empty array if the collection is empty', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAll(collection('nope'))
    )
    await waitForNextUpdate()
    assert.deepEqual(result.current[0], [])
  })

  it('returns loading state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAll(books))
    assert(result.current[1].loading)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
  })

  it('returns error state', async () => {
    await lockDB()
    const { result, waitForNextUpdate } = renderHook(() => useAll(books))
    assert(result.current[1].loading)
    assert(!result.current[1].error)
    await waitForNextUpdate()
    assert(!result.current[1].loading)

    assert(result.current[1].error)
  })
})
