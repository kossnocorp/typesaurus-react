# 🦕 Typesaurus React

React Hooks for [Typesaurus](https://github.com/kossnocorp/typesaurus), type-safe Firestore ODM.

<hr>
<div align="center">
🔥🔥🔥 <strong>The project is sponsored by <a href='https://backupfire.dev/'>Backup Fire</a>, backup service for Firebase</strong> 🔥🔥🔥
</div>
<hr>

## Installation

The library is available as an npm package. To install Typesaurus React run:

```sh
# React:
npm install @typesaurus/react --save
# Or using Yarn:
yarn add @typesaurus/react

# Preact:
npm install @typesaurus/preact --save
# Or using Yarn:
yarn add @typesaurus/preact
```

_Note that Typesaurus React has Typesaurus listed as a peer dependency which also requires `firebase` package to work in the web environment. The latter isn't listed in dependencies, so make sure you did install both. For more info about Typesaurus dependencies, refer to its Installation section of README. Also, if you have to have `react` or `preact` installed for `@typesaurus/react` and `@typesaurus/preact` respectively._

Additionally, when using with ESM-enabled bundler (like webpack), you'll need to install `lazyfire` that enables asynchronous importing of Firebase modules in the web environment:

```sh
npm install lazyfire --save
# Or using Yarn:
yarn add lazyfire
```

[Read more about Lazy Fire](https://github.com/kossnocorp/lazyfire).

## Configuration

Typesaurus React does not require additional configuration, however **when using with ESM-enabled bundler, you should transpile `node_modules`**. TypeScript preserves many modern languages features when it compiles to ESM code. So if you have to support older browsers, use Babel to process the dependencies code

## Get started

### Initialization

To start working with Typesaurus React, you'll need to initialize Firebase.

#### ESM-enabled environment

In the web environment when using ESM-enabled bundler (like webpack), use [Lazy Fire](https://github.com/kossnocorp/lazyfire) to configure the Firebase application:

```ts
import { configureApp } from 'lazyfire'

configureApp({
  // Firebase app configuration
})
```

#### Legacy environment

In the web environment with ESM-disabled ([see Firebase docs](https://firebase.google.com/docs/web/setup#add-sdks-initialize)):

```ts
import * as firebase from 'firebase/app'
import 'firebase/firestore'

firebase.initializeApp({
  // Firebase app configuration
})
```

[See Firebase docs for more info](https://firebase.google.com/docs/web/setup#add-sdks-initialize).

### Getting a single document

Use `useGet` hook to fetch document with the given id.

```tsx
import React from 'react'
import { useGet } from '@typesaurus/react'
import { collection } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

function Component({ userId }: { userId: string }) {
  const [user, { loading, error }] = useGet(users, userId)

  if (user) {
    return <div>Hello, {user.data.name}</div>
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the user!</div>
  }
}
```

Use `useOnGet` hook to subscribe to a document with the given id. When the document changes you'll receive the new data automatically.

```tsx
import React from 'react'
import { useOnGet } from '@typesaurus/react'
import { collection } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

function Component({ userId }: { userId: string }) {
  const [user, { loading, error }] = useOnGet(users, userId)

  if (user) {
    return <div>Hello, {user.data.name}</div>
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the user!</div>
  }
}
```

### Getting all documents from a collection

Use `useAll` hook to fetch all documents from a collection.

```tsx
import React from 'react'
import { useAll } from '@typesaurus/react'
import { collection } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

function Component() {
  const [allUsers, { loading, error }] = useAll(users)

  if (allUsers) {
    return (
      <ul>
        {allUsers.map(user => (
          <li>{user.data.name}</li>
        ))}
      </ul>
    )
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the users list!</div>
  }
}
```

Use `useOnAll` hook to subscribe to all documents within a collection. When a document in the collection changes you'll receive the new data.

```tsx
import React from 'react'
import { useOnAll } from '@typesaurus/react'
import { collection } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

function Component() {
  const [allUsers, { loading, error }] = useOnAll(users)

  if (allUsers) {
    return (
      <ul>
        {allUsers.map(user => (
          <li>{user.data.name}</li>
        ))}
      </ul>
    )
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the users list!</div>
  }
}
```

### Querying documents from a collection

Use `useQuery` hook to query documents from a collection using using query objects.

```tsx
import React from 'react'
import { useQuery } from '@typesaurus/react'
import { collection, where } from 'typesaurus'

type Game = { title: string; platform: 'switch' | 'xbox' | 'ps' | 'pc' }
const games = collection<Game>('games')

function Component() {
  const [switchGames, { loading, error }] = useQuery(games, [
    where('platform', '==', 'switch')
  ])

  if (switchGames) {
    return (
      <ul>
        {switchGames.map(game => (
          <li>{game.data.title}</li>
        ))}
      </ul>
    )
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the games list!</div>
  }
}
```

Use `useOnQuery` hook to subscribe to a query results. When the result changes you'll receive the new data.

```tsx
import React from 'react'
import { useOnQuery } from '@typesaurus/react'
import { collection, where } from 'typesaurus'

type Game = { title: string; platform: 'switch' | 'xbox' | 'ps' | 'pc' }
const games = collection<Game>('games')

function Component() {
  const [switchGames, { loading, error }] = useOnQuery(games, [
    where('platform', '==', 'switch')
  ])

  if (switchGames) {
    return (
      <ul>
        {switchGames.map(game => (
          <li>{game.data.title}</li>
        ))}
      </ul>
    )
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the games list!</div>
  }
}
```

### Getting multiple documents

Use `useGetMany` hook to fetch multiple documents by the given ids.

```tsx
import React from 'react'
import { useGetMany } from '@typesaurus/react'
import { collection } from 'typesaurus'

type Game = { title: string; platform: 'switch' | 'xbox' | 'ps' | 'pc' }
const games = collection<Game>('games')

function Component({ cardIds }: { cardIds: string[] }) {
  const [cardGames, { loading, error }] = useGetMany(games, cardIds)

  if (cardGames) {
    return (
      <ul>
        {cardGames.map(game => (
          <li>{game.data.title}</li>
        ))}
      </ul>
    )
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the games list!</div>
  }
}
```

Use `useOnGetMany` hook to subscribe to multiple documents by the given ids. When a document changes you'll receive the new data automatically.

```tsx
import React from 'react'
import { useOnGetMany } from '@typesaurus/react'
import { collection } from 'typesaurus'

type Game = { title: string; platform: 'switch' | 'xbox' | 'ps' | 'pc' }
const games = collection<Game>('games')

function Component({ cardIds }: { cardIds: string[] }) {
  const [cardGames, { loading, error }] = useOnGetMany(games, cardIds)

  if (cardGames) {
    return (
      <ul>
        {cardGames.map(game => (
          <li>{game.data.title}</li>
        ))}
      </ul>
    )
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the games list!</div>
  }
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

```tsx
import React from 'react'
import { useInfiniteQuery } from '@typesaurus/react'
import { collection, where } from 'typesaurus'

type Game = {
  title: string
  platform: 'switch' | 'xbox' | 'ps' | 'pc'
  publishedAt: Date
}
const games = collection<Game>('games')

function Component() {
  const [switchGames, { loading, error, loadMore }] = useInfiniteQuery(
    games,
    [where('platform', '==', 'switch')],
    { field: 'publishedAt', method: 'desc', limit: 9 }
  )

  if (switchGames) {
    return (
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
    )
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the games list!</div>
  }
}
```

Combine `useInfiniteQuery` with `useInfiniteScroll` to implement the infinite scroll.

`useInfiniteScroll` accepts two arguments. The first is the scroll threshold. If you pass `0.5`, then more results will load when the scroll position is more than full height minus 1.5 x screen height. The second argument is `loadMore` function returned from `useInfiniteQuery`.

```tsx
import React from 'react'
import { useInfiniteQuery, useInfiniteScroll } from '@typesaurus/react'
import { collection, where } from 'typesaurus'

type Game = {
  title: string
  platform: 'switch' | 'xbox' | 'ps' | 'pc'
  publishedAt: Date
}
const games = collection<Game>('games')

function Component() {
  const [switchGames, { loading, error, loadMore }] = useInfiniteQuery(
    games,
    [where('platform', '==', 'switch')],
    { field: 'publishedAt', method: 'desc', limit: 9 }
  )
  useInfiniteScroll(0.5, loadMore)

  if (switchGames) {
    return (
      <ul>
        {switchGames.map(game => (
          <li>{game.data.title}</li>
        ))}
      </ul>
    )
  } else if (loading) {
    return <div>Loading...</div>
  } else if (error) {
    return <div>Failed to load the games list!</div>
  }
}
```

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
