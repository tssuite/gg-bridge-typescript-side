// @license
// Copyright (c) 2026 tssuite
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { defineConfig } from 'vite';

// The deployment base path can be passed at build time via the `--base` CLI
// flag, e.g. `pnpm build --base=/gg-bridge-typescript-side/` to deploy under
// `https://my.domain.com/gg-bridge-typescript-side/`. Defaults to `/`.
export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    // Served as-is so the wasm asset referenced by the bridge stays
    // resolvable during dev.
    exclude: ['@tssuite/gg-bridge-dart-typescript'],
  },
  server: {
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
    rolldownOptions: {
      onLog(level, log, handler) {
        if (
          log.message?.includes(
            'has been externalized for browser compatibility',
          )
        ) {
          return;
        }
        handler(level, log);
      },
      output: {
        codeSplitting: true,
      },
    },
  },
});
