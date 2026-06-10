// @license
// Copyright (c) 2026 tssuite
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

// Thin browser entry — initializes the Dart bridge and wires DOM nodes
// to the App. Excluded from coverage; the testable logic lives in
// sibling modules.

import { checkWasmGcSupport, init } from '@tssuite/gg-bridge-dart-typescript';
import wasmUrl from '@tssuite/gg-bridge-dart-typescript/wasm?url';

import { App } from './app/app.ts';

const root = document.getElementById('app') as HTMLDivElement;

/**
 * Initializes the Dart bridge and renders the app.
 */
async function main(): Promise<void> {
  // Surface a clear message when the browser is missing Wasm-GC support
  // before we even try to load the bundle.
  const support = checkWasmGcSupport();
  if (!support.supported) {
    const pre = document.createElement('pre');
    pre.textContent = 'Browser not supported:\n' + support.reasons.join('\n');
    root.replaceChildren(pre);
    return;
  }

  // Pre-warm the bridge with the bundler-resolved wasm URL.
  const bridge = await init({ wasmUrl });
  await new App(root, bridge).render();
}

main().catch((e: unknown) => {
  console.error(e);
  const pre = document.createElement('pre');
  pre.textContent = e instanceof Error ? e.message : String(e);
  root.replaceChildren(pre);
});
