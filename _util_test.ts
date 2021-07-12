import { assertEquals } from "./vendor/https/deno.land/std/testing/asserts.ts";
import { hasDefaultExport } from "./_util.ts";
const { test } = Deno;

test("hasDefaultExport", () => {
  for (
    const { want, input } of [
      {
        want: true,
        input: `export default from "https://deno.land/foo/bar.ts"`,
      },
      {
        want: true,
        input: `export { default } from "https://deno.land/foo/bar.ts"`,
      },
      {
        want: true,
        input: `export{default}from "https://deno.land/foo/bar.ts"`,
      },
      {
        want: false,
        input:
          `export { assert } from "https://deno.land/std/testing/asserts.ts"`,
      },
      {
        want: true,
        input: `export { foo, default } from "https://deno.land/foo/bar.ts"`,
      },
      {
        want: false,
        input: `export { defaultValue } from "https://deno.land/foo/bar.ts"`,
      },
      {
        want: true,
        input: `export { bar as default } from "https://deno.land/foo/bar.ts"`,
      },
    ]
  ) {
    const got = hasDefaultExport(input);
    assertEquals(
      got,
      want,
      `Given "${input}", hasDefaultExport should return ${want}`,
    );
  }
});
