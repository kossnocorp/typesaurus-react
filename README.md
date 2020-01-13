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
npm install reactopod --save
# Or using Yarn:
yarn add reactopod
```

_Note that Reactopod has Typesaurus listed as a peer dependency which also requires `firebase` package to work in the web environment. The latter isn't listed in dependencies, so make sure you did install both. For more info about Typesaurus dependencies, refer to its Installation section of README._

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

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
