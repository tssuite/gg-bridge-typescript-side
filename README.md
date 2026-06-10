<!--
@license
Copyright (c) 2026 tssuite

Use of this source code is governed by terms that can be
found in the LICENSE file in the root of this package.
-->

# gg-bridge-typescript-side

The typescript side of a dart - bridge - typescript project.

## Update dependencies

```bash
pnpm update --latest
```

If something fails while updating, try the following:

```bash
rm -rf node_modules
rm -rf pnpm-lock.yaml
pnpm update --latest
```

## Build the app

```bash
pnpm run build
```

## Run the app in dev mode

```bash
pnpm run dev
```

## Run the tests

```bash
pnpm run test
```

## Run the e2e tests

```bash
pnpm run test:e2e
```
