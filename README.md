# 🍹dlink 🦕

[![Build Status](https://github.com/keroxp/dlink/workflows/CI/badge.svg)](https://github.com/keroxp/dlink/actions)
![https://img.shields.io/github/tag/keroxp/dlink.svg](https://img.shields.io/github/tag/keroxp/dlink.svg)
[![license](https://img.shields.io/github/license/keroxp/dlink.svg)](https://github.com/keroxp/dlink)

Deno module linker

# Concept

`dlink` is designed to manage URL module specifiers for
[Deno](https://deno.land).

Managing URL module specifier in Deno is qutie hard. dlink is designed to
resolve these problems by familiar way for developers.

# Install

```bash
$ deno install --allow-write --allow-read --allow-net https://deno.land/x/dlink/dlink.ts
```

with install directory:

```bash
$ deno install --allow-write --allow-read --allow-net -d /usr/local/bin dlink https://deno.land/x/dlink/dlink.ts
```

# Usage

## 1. Run `dlink`

```bash
$ cd ./project
$ dlink
```

## 2. Edit `modules.json` file

```json
{
  "https://deno.land/std": {
    "version": "@v0.32.0",
    "modules": ["/fs/mod.ts", "/fs/path.ts", "/flags/mod.ts"]
  }
}
```

## 2. Run `dlink` command

```bash
$ dlink
Linked: https://deno.land/std@v0.32.0/fs/mod.ts -> ./vendor/https/deno.land/std/fs/mod.ts
Linked: https://deno.land/std@v0.32.0/fs/path.ts -> ./vendor/https/deno.land/std/fs/path.ts
Linked: https://deno.land/std@v0.32.0/flags/mod.ts -> ./vendor/https/deno.land/std/flags/mod.ts
```

dlink will automatically create module asias files that are described in
`modules.json`. If there are `modules.json` like below:

```json
{
  ":moduleId": {
    "version": ":version",
    "modules": [":moduleFile"]
  }
}
```

- Alias for `":modileFile"` will be created at:
  `./vendor/{:moduleId}/{:moduleFile}`
- Aalis is contains: `export * from "{:moduleId}{:version}{:moduleFile}"`

### 3. Import module aliases

```ts
import * fs from "./vendor/https/deno.land/std/fs/mod.ts"
```

## Prior works

- [dem](https://github.com/syumai/dem)

## LICENSE

MIT
