.DEFAULT_GOAL := build
.PHONY: build

BIN = $(shell yarn bin)

test:
	${BIN}/firebase emulators:exec --only firestore "${BIN}/karma start --single-run"
.PHONY: test

test-watch:
	${BIN}/firebase emulators:exec --only firestore "${BIN}/karma start"

test-setup:
	${BIN}/firebase setup:emulators:firestore

test-system:
	env SYSTEM_TESTS=true ${BIN}/karma start --single-run

test-system-watch:
	env SYSTEM_TESTS=true ${BIN}/karma start

build:
	@rm -rf lib
	@${BIN}/tsc
	@${BIN}/prettier "lib/**/*.[jt]s" --write --loglevel silent
	@cp {package.json,*.md} lib/reactopod
	@rsync --archive --prune-empty-dirs --exclude '*.ts' --relative src/./ lib/reactopod
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