// @license
// Copyright (c) 2026 tssuite
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

/// <reference types="vitest" />

import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/setup/test-setup.ts'],
      include: ['test/**/*.spec.ts'],
      exclude: ['tests-e2e/**', 'node_modules/**', 'dist/**'],

      reporters: ['default'],
      coverage: {
        enabled: true,
        provider: 'v8', // "istanbul" or "v8"
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts'],
        // Entry point — only wires DOM nodes to the App. Logic is in sibling
        // modules and is covered there.
        exclude: ['src/main.ts'],
        all: true,
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        checkCoverage: true,
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
