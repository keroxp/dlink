#!/usr/bin/env deno --allow-write --allow-read
import * as path from "./vendor/https/deno.land/std/fs/path.ts";
import * as fs from "./vendor/https/deno.land/std/fs/mod.ts";
import * as flags from "./vendor/https/deno.land/std/flags/mod.ts";
import { green, gray } from "./vendor/https/deno.land/std/fmt/colors.ts";
import { Modules } from "./mod.ts";

function isDinkModules(x, errors: string[]): x is Modules {
  if (typeof x !== "object") {
    errors.push("is not object");
    return false;
  }
  for (const k in x) {
    if (x.hasOwnProperty(k)) {
      const m = x[k];
      if (typeof m["version"] !== "string") {
        errors.push('"version" must be string');
        return false;
      }
      if (!Array.isArray(m["modules"])) {
        errors.push(`\"modules\" must be array`);
        return false;
      }
      for (const mod of m["modules"]) {
        if (typeof mod !== "string") {
          errors.push(`"content of "modules" must be string`);
          return false;
        }
      }
    }
  }
  return true;
}

async function ensure(modules: Modules) {
  const encoder = new TextEncoder();
  for (const [k, v] of Object.entries(modules)) {
    const url = new URL(k);
    const { protocol, hostname, pathname } = url;
    const scheme = protocol.slice(0, protocol.length - 1);
    const dir = path.join("./vendor", scheme, hostname, pathname);
    const writeLinkFile = async (mod: string) => {
      const modFile = path.join(dir, mod);
      const modDir = path.dirname(modFile);
      const specifier = `${k}${v.version}${mod}`;
      if (await fs.exists(modFile)) {
        console.log(gray(`Linked: ${specifier} -> ./${modFile}`));
        return;
      }
      const resp = await fetch(specifier, { method: "HEAD" });
      if (resp.status !== 200) {
        throw new Error(`failed to fetch metadata for ${specifier}`);
      }
      const link = `export * from "${resp.url}";\n`;
      await Deno.mkdir(modDir, true);
      const f = await Deno.open(modFile, "w");
      try {
        await Deno.write(f.rid, encoder.encode(link));
      } finally {
        f.close();
      }
      console.log(`${green("Linked")}: ${specifier} -> ./${modFile}`);
    };
    await Promise.all(v.modules.map(writeLinkFile));
  }
}

const VERSION = "0.3.0";

type DinkOptions = {
  file?: string;
};

async function main() {
  const args = flags.parse(Deno.args, {
    alias: {
      h: "help",
      V: "ver"
    },
    "--": true
  });
  if (args["V"] || args["ver"]) {
    console.log(VERSION);
    Deno.exit(0);
  }
  if (args["h"] || args["help"]) {
    console.log(
      String(`
    USAGE

      dink -A
        or
      dink --allow-write --allow-read 

    ARGUMENTS

    OPTIONS
   
      -f, --file         Custom path for module.json  (Optional)         
       
    GLOBAL OPTIONS
    
      -h, --help         Display help
      -V, --ver          Display version
         
    `)
    );
    Deno.exit(0);
  }
  const opts: DinkOptions = {
    file: "./modules.json"
  };
  if (args["f"]) {
    opts.file = args["f"];
  }
  if (!(await fs.exists(opts.file))) {
    console.error(`${opts.file} does not exists`);
    Deno.exit(1);
  }
  const file = await Deno.readFile(opts.file);
  const decoder = new TextDecoder();
  const json = JSON.parse(decoder.decode(file)) as Modules;
  const errors = [];
  if (!isDinkModules(json, errors)) {
    console.error(`${opts.file} has syntax error: ${errors.join(",")}`);
    Deno.exit(1);
  }
  await ensure(json);
  Deno.exit(0);
}

main();
