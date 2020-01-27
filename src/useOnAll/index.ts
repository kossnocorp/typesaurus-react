import { Collection } from 'typesaurus/collection'
import { Doc } from 'typesaurus/doc'
import onAll from 'typesaurus/onAll'
import { useEffect, useState } from '../adaptor'

export default function useOnAll<Model>(
  collection: Collection<Model>
): Doc<Model>[] | undefined {
  const [result, setResult] = useState<Doc<Model>[] | undefined>(undefined)

  const deps = [JSON.stringify(collection)]
  useEffect(() => onAll(collection, setResult), deps)

  return result
}
