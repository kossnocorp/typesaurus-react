import * as testing from '@firebase/testing'
import { renderHook } from '@testing-library/react-hooks'
import assert from 'assert'
import { Collection, collection, set } from 'typesaurus'
import { setApp } from 'typesaurus/testing'
import useGetMany from '.'
import { lockDB } from '../../test/_lib/utils'

describe('useGetMany', () => {
  type Fruit = { color: string }
  const fruits = collection<Fruit>('fruits')
  const altFruits = collection<Fruit>('altFruits')

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

  it('cleans the data and refetch when the collection is changing', async () => {
    await Promise.all([
      set(altFruits, 'apple', { color: 'зеленый' }),
      set(altFruits, 'banana', { color: 'желтый' }),
      set(altFruits, 'orange', { color: 'оранжевый' })
    ])
    const initialProps: { collection: Collection<any> } = { collection: fruits }
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ collection }) =>
        useGetMany(collection, ['banana', 'apple', 'banana', 'orange']),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0])
    rerender({ collection: altFruits })
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]![0].data.color === 'желтый')
  })

  it('cleans the data and refetch when the ids is changing', async () => {
    const initialProps: { ids: string[] } = {
      ids: ['banana', 'apple', 'banana', 'orange']
    }
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ ids }) => useGetMany(fruits, ids),
      { initialProps }
    )
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0])
    rerender({ ids: ['orange'] })
    assert(result.current[0] === undefined)
    await waitForNextUpdate()
    assert(result.current[0]!.length === 1)
    assert(result.current[0]![0].data.color === 'orange')
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
