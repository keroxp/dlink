import {
  assertEquals,
  assert,
} from "./vendor/https/deno.land/std/testing/asserts.ts";
const { test } = Deno;

async function beforeEach() {
  const tmpDir = await Deno.makeTempDir();
  const p = Deno.run({
    cmd: ["cp", "-R", "fixtures", tmpDir],
  });
  await p.status();
  p.close();
  // console.log(tmpDir);
  return tmpDir + "/fixtures";
}
const fixturesDir = await beforeEach();
const dirname = new URL(".", import.meta.url).pathname;
async function runDink(dir: string) {
  const p = await Deno.run({
    cmd: [Deno.execPath(), "run", "-A", dirname + "/main.ts"],
    cwd: dir,
  });
  const resp = await p.status();
  p.close();
  assertEquals(resp.success, true);
  assertEquals(resp.code, 0);
}

const printIndent = (indent: number): string => {
  let ret = "";
  for (let i = 0; i < indent; i++) ret += "  ";
  return ret;
};

async function treeDir(dir: string, dest: { text: string }, depth = 0) {
  let files = [...Deno.readDirSync(dir)];
  files = files.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      if (a.name && b.name) {
        return a.name?.localeCompare(b.name);
      } else if (a.name) {
        return -1;
      } else if (b.name) {
        return 1;
      }
      return 0;
    } else {
      return a.isDirectory ? 1 : -1;
    }
  });
  for (const i of files) {
    dest.text += printIndent(depth + 1) + i.name + "\n";
    if (i.isDirectory) {
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
`,
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
`,
  );
});

test("basic_remove_dir", async () => {
  const dir = fixturesDir + "/basic_remove_dir";
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
`,
  );
});

test("basic_remove_module", async () => {
  const dir = fixturesDir + "/basic_remove_module";
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
`,
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
`,
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
`,
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
`,
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
`,
  );
});

test("removed_dir", async () => {
  const dir = fixturesDir + "/removed_dir";
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
          fmt
            colors.ts
          testing
            asserts.ts
`,
  );
});

test("beforeAll", async () => {
  await Deno.remove(fixturesDir, { recursive: true });
});
