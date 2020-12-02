.DEFAULT_GOAL := build
.PHONY: build

BIN = $(shell yarn bin)

test:
	${BIN}/firebase emulators:exec --only firestore "${BIN}/jest --env node"
.PHONY: test

test-watch:
	${BIN}/firebase emulators:exec --only firestore "${BIN}/jest --env node --watch --runInBand"

test-setup:
	${BIN}/firebase setup:emulators:firestore

test-system: test-system-node test-system-browser

test-system-node:
	${BIN}/jest --env node

test-system-node-watch:
	${BIN}/jest --env node --watch

test-system-browser:
	${BIN}/karma start --single-run

test-system-browser-watch:
	${BIN}/karma start

build:
	@rm -rf lib
	@${BIN}/tsc --project tsconfig.lib.json
	@${BIN}/prettier "lib/**/*.[jt]s" --write --loglevel silent
	@cp package.json lib/reactopod
	@cp *.md lib/reactopod
	@rsync --archive --prune-empty-dirs --exclude '*.ts' --relative src/./ lib/reactopod
	@${BIN}/tsc --project tsconfig.lib.json --outDir lib/reactopod/esm --module es2020 --target es2019
	@cp src/adaptor/package.json lib/reactopod/esm/adaptor/package.json
	@cp -r lib/reactopod lib/preactopod
	@${BIN}/ts-node scripts/patchReactopod.ts
	@${BIN}/ts-node scripts/patchPreactopod.ts

publish: build
	cd lib/reactopod && npm publish --access public
	cd lib/preactopod && npm publish --access public

publish-next: build
	cd lib/reactopod && npm publish --access public --tag next
	cd lib/preactopod && npm publish --access public --tag next

docs:
	@${BIN}/typedoc --theme minimal --name Reactopod
.PHONY: docs