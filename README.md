# 🦕 Reactopod

React Hooks for [Typesaurus](https://github.com/kossnocorp/typesaurus), type-safe Firestore ODM.

<hr>
<div align="center">
🔥🔥🔥 <strong>The project is sponsored by <a href='https://backupfire.dev/'>Backup Fire</a>, backup service for Firebase</strong> 🔥🔥🔥
</div>
<hr>

## Installation

The library is available as an [npm package](https://www.npmjs.com/package/reactopod).
To install Reactopod run:

```sh
# React:
npm install reactopod --save
# Or using Yarn:
yarn add reactopod

# Preact:
npm install preactopod --save
# Or using Yarn:
yarn add preactopod
```

_Note that Reactopod has Typesaurus listed as a peer dependency which also requires `firebase` package to work in the web environment. The latter isn't listed in dependencies, so make sure you did install both. For more info about Typesaurus dependencies, refer to its Installation section of README. Also, if you have to have `react` or `preact` installed for `reactopod` and `preactopod` respectively._

## Get started

### Initialization

To start working with Reactopod, initialize Firebase normally:

```ts
import * as firebase from 'firebase/app'
import 'firebase/firestore'

firebase.initializeApp({
  // Project configuration
})
```

[See Firebase docs for more info](https://firebase.google.com/docs/web/setup#add-sdks-initialize).

### Getting a single document

Use `useGet` hook to fetch document with the given id.

```ts
import { createElement } from 'react'
import { useGet } from 'reactopod'
import { collection } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

function Component({ userId }: { userId: string }) {
  const user = useGet(users, userId)
  return user ? <div>Hello, {user.data.name}</div> : <div>Loading...</div>
}
```

Use `useOnGet` hook to subscribe to a document with the given id. When the document changes you'll receive the new data automatically.

```ts
import { createElement } from 'react'
import { useOnGet } from 'reactopod'
import { collection } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

function Component({ userId }: { userId: string }) {
  const user = useOnGet(users, userId)
  return user ? <div>Hello, {user.data.name}</div> : <div>Loading...</div>
}
```

### Getting all documents from a collection

Use `useAll` hook to fetch all documents from a collection.

```ts
import { createElement } from 'react'
import { useAll } from 'reactopod'
import { collection } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

function Component() {
  const allUsers = useAll(users)
  return allUsers ? (
    <ul>
      {allUsers.map(user => (
        <li>{user.data.name}</li>
      ))}
    </ul>
  ) : (
    <div>Loading...</div>
  )
}
```

Use `useOnAll` hook to subscribe to all documents within a collection. When a document in the collection changes you'll receive the new data.

```ts
import { createElement } from 'react'
import { useOnAll } from 'reactopod'
import { collection } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

function Component() {
  const allUsers = useOnAll(users)
  return allUsers ? (
    <ul>
      {allUsers.map(user => (
        <li>{user.data.name}</li>
      ))}
    </ul>
  ) : (
    <div>Loading...</div>
  )
}
```

### Querying documents from a collection

Use `useQuery` hook to query documents from a collection using using query objects.

```ts
import { createElement } from 'react'
import { useQuery } from 'reactopod'
import { collection, where } from 'typesaurus'

type Game = { title: string; platform: 'switch' | 'xbox' | 'ps' | 'pc' }
const games = collection<Game>('games')

function Component() {
  const switchGames = useQuery(games, [where('platform', '==', 'switch')])
  return switchGames ? (
    <ul>
      {switchGames.map(game => (
        <li>{game.data.title}</li>
      ))}
    </ul>
  ) : (
    <div>Loading...</div>
  )
}
```

Use `useOnQuery` hook to subscribe to a query results. When the result changes you'll receive the new data.

```ts
import { createElement } from 'react'
import { useOnQuery } from 'reactopod'
import { collection, where } from 'typesaurus'

type Game = { title: string; platform: 'switch' | 'xbox' | 'ps' | 'pc' }
const games = collection<Game>('games')

function Component() {
  const switchGames = useOnQuery(games, [where('platform', '==', 'switch')])
  return switchGames ? (
    <ul>
      {switchGames.map(game => (
        <li>{game.data.title}</li>
      ))}
    </ul>
  ) : (
    <div>Loading...</div>
  )
}
```

See [Typesaurus documentation](https://typesaurus.com/) for more info about the query objects:

- [`order`](https://typesaurus.com/modules/_order_index_.html#order) - Creates order query object with given field, ordering method and pagination cursors.
- [`limit`](https://typesaurus.com/modules/_limit_index_.html#limit) - Creates a limit query object. It's used to paginate queries.
- [`where`](https://typesaurus.com/modules/_where_index_.html#where) - Creates where query with array-contains filter operation.

Pagination helpers:

- [`endAt`](https://typesaurus.com/modules/_cursor_index_.html#endat) - Ends the query results on the given value.
- [`endBefore`](https://typesaurus.com/modules/_cursor_index_.html#endbefore) - Ends the query results before the given value.
- [`startAfter`](https://typesaurus.com/modules/_cursor_index_.html#startafter) - Start the query results after the given value.
- [`startAt`](https://typesaurus.com/modules/_cursor_index_.html#startat) - Start the query results on the given value.

### Querying documents with pagination

Use `useInfiniteQuery` to query documents with pagination.

The function returns an array where the first element is the result and the second is `loadMore`. `loadMore` is `undefined` when the result is loading. `loadMore` is `null` when there're no more data to load. Otherwise `loadMore` is a function that triggers loading of the next page.

```ts
import { createElement } from 'react'
import { useInfiniteQuery } from 'reactopod'
import { collection, where } from 'typesaurus'

type Game = {
  title: string
  platform: 'switch' | 'xbox' | 'ps' | 'pc'
  publishedAt: Date
}
const games = collection<Game>('games')

function Component() {
  const [switchGames, loadMore] = useInfiniteQuery(
    games,
    [where('platform', '==', 'switch')],
    { field: 'publishedAt', method: 'desc', limit: 10 }
  )

  return switchGames ? (
    <div>
      <ul>
        {switchGames.map(game => (
          <li>{game.data.title}</li>
        ))}
      </ul>

      {loadMore === undefined ? (
        <div>Loading more...</div>
      ) : loadMore === null ? null : (
        <button onClick={loadMore}>Load more</button>
      )}
    </div>
  ) : (
    <div>Loading...</div>
  )
}
```

Combine `useInfiniteQuery` with `useInfiniteScroll` to implement the infinite scroll.

`useInfiniteScroll` accepts two arguments. The first is the scroll threshold. If you pass `1.5`, then more results will load when the scroll position is more than full height minus 1.5 x screen height. The second argument is `loadMore` function returned from `useInfiniteQuery`.

```ts
import { createElement } from 'react'
import { useInfiniteQuery, useInfiniteScroll } from 'reactopod'
import { collection, where } from 'typesaurus'

type Game = {
  title: string
  platform: 'switch' | 'xbox' | 'ps' | 'pc'
  publishedAt: Date
}
const games = collection<Game>('games')

function Component() {
  const [switchGames, loadMore] = useInfiniteQuery(
    games,
    [where('platform', '==', 'switch')],
    { field: 'publishedAt', method: 'desc', limit: 10 }
  )
  useInfiniteScroll(1.5, loadMore)
  return switchGames ? (
    <ul>
      {switchGames.map(game => (
        <li>{game.data.title}</li>
      ))}
    </ul>
  ) : (
    <div>Loading...</div>
  )
}
```

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
