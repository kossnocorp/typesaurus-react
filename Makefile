.DEFAULT_GOAL := build
.PHONY: build

types:
	npx tsc --build

types-watch:
	npx tsc --build --watch

test-types: install-attw build 
	@cd lib/reactopod && attw --pack
	@cd lib/preactopod && attw --pack

build:
	@rm -rf lib
	@npx tsc --project tsconfig.lib.json
	@env BABEL_ENV=esm npx babel src --config-file ./babel.config.lib.json --source-root src --out-dir lib/reactopod --extensions .mjs,.ts --out-file-extension .mjs --quiet
	@env BABEL_ENV=cjs npx babel src --config-file ./babel.config.lib.json --source-root src --out-dir lib/reactopod --extensions .mjs,.ts --out-file-extension .js --quiet
	@make build-mts
	@cp package.json lib/reactopod
	@cp *.md lib/reactopod
	@cp -r lib/reactopod lib/preactopod
	@npx tsx scripts/patchReactopod.ts
	@npx tsx scripts/patchPreactopod.ts

build-mts:
	@find lib/reactopod -name '*.d.ts' | while read file; do \
		new_file=$${file%.d.ts}.d.mts; \
		cp $$file $$new_file; \
	done

publish: build
	@cd lib/reactopod && npm publish --access public
	@cd lib/preactopod && npm publish --access public

publish-next: build
	@cd lib/reactopod && npm publish --access public --tag next
	@cd lib/preactopod && npm publish --access public --tag next

install-attw:
	@if ! command -v attw >/dev/null 2>&1; then \
		npm i -g @arethetypeswrong/cli; \
	fi