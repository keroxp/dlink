import {
  assertEquals,
  assert
} from "./vendor/https/deno.land/std/testing/asserts.ts";
import { runIfMain, test } from "./vendor/https/deno.land/std/testing/mod.ts";
async function beforeEach() {
  const tmpDir = await Deno.makeTempDir();
  await Deno.run({
    args: ["cp", "-R", "fixtures", tmpDir]
  }).status();
  // console.log(tmpDir);
  return tmpDir + "/fixtures";
}
const fixturesDir = await beforeEach();
const dirname = new URL(".", import.meta.url);
async function runDink(dir: string) {
  const resp = await Deno.run({
    args: [Deno.execPath(), "-A", dirname + "/main.ts"],
    cwd: dir
    // stdout: "piped"
  }).status();
  assertEquals(resp.success, true);
  assertEquals(resp.code, 0);
}

const printIndent = (indent: number): string => {
  let ret = "";
  for (let i = 0; i < indent; i++) ret += "  ";
  return ret;
};

async function treeDir(dir: string, dest: { text: string }, depth = 0) {
  let files = await Deno.readDir(dir);
  files = files.sort((a, b) => {
    if (a.isDirectory() === b.isDirectory()) {
      return a.name.localeCompare(b.name);
    } else {
      return a.isDirectory() ? 1 : -1;
    }
  });
  for (const i of files) {
    dest.text += printIndent(depth + 1) + i.name + "\n";
    if (i.isDirectory()) {
      await treeDir(dir + "/" + i.name, dest, depth + 1);
    }
  }
}

// const dest = {text: ""};
// await treeDir("./fixtures", dest);
// console.log(dest.text);
// Deno.exit(0);
async function assertDir(dir: string, exp: string) {
  const dest = { text: "\n" };
  await treeDir(dir, dest);
  assertEquals(dest.text, exp);
}
test("basic", async () => {
  const dir = fixturesDir + "/basic";
  await runDink(dir);
  await assertDir(
    dir,
    `
  modules-lock.json
  modules.json
  vendor
    https
      deno.land
        std
          testing
            asserts.ts
            mod.ts
`
  );
});
test("basic_no_lock", async () => {
  const dir = fixturesDir + "/basic_no_lock";
  await runDink(dir);
  await assertDir(
    dir,
    `
  modules-lock.json
  modules.json
  vendor
    https
      deno.land
        std
          testing
            asserts.ts
            mod.ts
`
  );
});
test("removed_from_file", async () => {
  const dir = fixturesDir + "/removed_from_file";
  await runDink(dir);
  await assertDir(
    dir,
    `
  modules-lock.json
  modules.json
  vendor
    https
      deno.land
        std
          testing
            mod.ts
`
  );
});

test("removed_from_file_all", async () => {
  const dir = fixturesDir + "/removed_from_file_all";
  await runDink(dir);
  await assertDir(
    dir,
    `
  modules-lock.json
  modules.json
  vendor
`
  );
});

test("removed_from_dir", async () => {
  const dir = fixturesDir + "/removed_from_dir";
  await runDink(dir);
  await assertDir(
    dir,
    `
  modules-lock.json
  modules.json
  vendor
    https
      deno.land
        std
          testing
            asserts.ts
            mod.ts
`
  );
});
test("removed_from_dir_all", async () => {
  const dir = fixturesDir + "/removed_from_dir_all";
  await runDink(dir);
  await assertDir(
    dir,
    `
  modules-lock.json
  modules.json
  vendor
    https
      deno.land
        std
          testing
            asserts.ts
            mod.ts
`
  );
});

runIfMain(import.meta).finally(async () => {
  await Deno.remove(fixturesDir, { recursive: true });
});
