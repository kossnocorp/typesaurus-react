import * as testing from '@firebase/testing'
import { renderHook } from '@testing-library/react-hooks'
import assert from 'assert'
import { collection, set } from 'typesaurus'
import { setApp } from 'typesaurus/testing'
import useGetMany from '.'
import { lockDB } from '../../test/_lib/utils'

describe('useAll', () => {
  type Fruit = { color: string }
  const fruits = collection<Fruit>('fruits')

  beforeAll(async () => {
    setApp(testing.initializeAdminApp({ projectId: 'project-id' }))

    await Promise.all([
      set(fruits, 'apple', { color: 'green' }),
      set(fruits, 'banana', { color: 'yellow' }),
      set(fruits, 'orange', { color: 'orange' })
    ])
  })

  beforeEach(() => {
    setApp(testing.initializeAdminApp({ projectId: 'project-id' }))
  })

  it('allows to get multiple docs by id', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGetMany(fruits, ['banana', 'apple', 'banana', 'orange'])
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    const [docs] = result.current
    expect(docs!.length).toBe(4)
    expect(docs![0].ref.id).toBe('banana')
    expect(docs![1].ref.id).toBe('apple')
    expect(docs![2].ref.id).toBe('banana')
    expect(docs![3].ref.id).toBe('orange')
  })

  it('returns loading state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGetMany(fruits, ['banana'])
    )
    assert(result.current[1].loading)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
  })

  it('returns error state', async () => {
    await lockDB()
    const { result, waitForNextUpdate } = renderHook(() =>
      useGetMany(fruits, ['banana'])
    )
    assert(result.current[1].loading)
    assert(!result.current[1].error)
    await waitForNextUpdate()
    assert(!result.current[1].loading)
    assert(result.current[1].error)
  })

  it('assign an error when an id is missing', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGetMany(fruits, ['nonexistant'])
    )
    assert(!result.current[1].error)
    await waitForNextUpdate()
    assert(result.current[1].error instanceof Error)
    assert(
      (result.current[1].error as Error).message ===
        'Missing document with id nonexistant'
    )
  })

  it('allows to specify custom logic when a document is not found', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGetMany(fruits, ['nonexistant'], id => ({
        color: `${id} is missing but I filled it in`
      }))
    )
    await waitForNextUpdate()
    const [docs] = result.current
    expect(docs!.length).toBe(1)
    expect(docs![0].data.color).toBe(
      'nonexistant is missing but I filled it in'
    )
  })

  it('allows to ignore missing documents', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGetMany(fruits, ['apple', 'nonexistant', 'banana'], 'ignore')
    )
    await waitForNextUpdate()
    const [docs] = result.current
    expect(docs!.length).toBe(2)
  })
})
