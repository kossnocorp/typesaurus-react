.DEFAULT_GOAL := build
.PHONY: build

BIN = $(shell yarn bin)

test:
	npx firebase emulators:exec --only firestore "npx jest --env node"
.PHONY: test

test-watch:
	npx firebase emulators:exec --only firestore "npx jest --env node --watch --detectOpenHandles"

test-setup:
	npx firebase setup:emulators:firestore

test-system: test-system-node test-system-browser

test-system-node:
	npx jest --env node

test-system-node-watch:
	npx jest --env node --watch

test-system-browser:
	npx karma start --single-run

test-system-browser-watch:
	npx karma start

build:
	@rm -rf lib
	@npx tsc --project tsconfig.lib.json
	@npx prettier "lib/**/*.[jt]s" --write --loglevel silent
	@cp package.json lib/reactopod
	@cp *.md lib/reactopod
	@rsync --archive --prune-empty-dirs --exclude '*.ts' --relative src/./ lib/reactopod
	@npx tsc --project tsconfig.lib.json --outDir lib/reactopod/esm --module es2020 --target es2019
	@cp src/adaptor/package.json lib/reactopod/esm/adaptor/package.json
	@cp -r lib/reactopod lib/preactopod
	@npx ts-node scripts/patchReactopod.ts
	@npx ts-node scripts/patchPreactopod.ts

publish: build
	cd lib/reactopod && npm publish --access public
	cd lib/preactopod && npm publish --access public

publish-next: build
	cd lib/reactopod && npm publish --access public --tag next
	cd lib/preactopod && npm publish --access public --tag next

docs:
	@npx typedoc --theme minimal --name Reactopod
.PHONY: docs