test:
	deno cache main.ts
	deno test -A main_test.ts