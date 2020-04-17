# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning].
This change log follows the format documented in [Keep a CHANGELOG].

[semantic versioning]: http://semver.org/
[keep a changelog]: http://keepachangelog.com/

## 3.0.0 - 2020-04-17

### Changed

- **BREAKING**: When using with ESM-enabled bundler, you should transpile `node_modules`. TypeScript preserves many modern languages features when it compiles to ESM code. So if you have to support older browsers, use Babel to process the dependencies code.

### Added

- Added ESM version of the code that enables tree-shaking.

## 2.0.0 - 2020-04-10

### Changed

- **BREAKING**: Now, when query or collection is changed, hook state resets to `undefined` while previously it would stay as is until the new data is fetched.

## 1.0.0 - 2020-02-20

### Changed

- **BREAKING**: Rename `reactopod` and `preactopod` to `@typesaurus/react` and `@typesaurus/preact`.

### Added

- Add functions:
  - `useGetMany`
  - `useOnGetMany`

## 0.4.2 - 2020-01-27

### Fixed

- Fixed the Preact package.

## 0.4.0 - 2020-01-27

### Added

- Added functions:
  - `useInfiniteQuery`
  - `useInfiniteScroll`
  - `useAll`
  - `useOnAll`

## 0.3.0 - 2020-01-15

### Changed

- **BREAKING**: `reactopod` now only supports React.

- Get rid of webpack warning during compilation.

### Added

- Publish separate `preactopod` package for Preact.

## 0.2.0 - 2020-01-14

### Changed

- Make Reactopod work both with React and Preact.

## 0.1.0 - 2020-01-13

### Added

- Added functions:
  - `useGet`
  - `useOnGet`
  - `useQuery`
  - `useOnQuery`
