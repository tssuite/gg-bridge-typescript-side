// @license
// Copyright (c) 2026 tssuite
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import {
  init,
  type DartBridge,
} from '@tssuite/gg-bridge-dart-typescript';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { App } from '../../src/app/app.ts';

describe('App', () => {
  let bridge: DartBridge;
  let root: HTMLDivElement;
  let app: App;

  beforeAll(async () => {
    // Load the real Dart/Wasm bridge — no stubs involved.
    bridge = await init();
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    root = document.getElementById('app') as HTMLDivElement;
    app = new App(root, bridge);
  });

  describe('render()', () => {
    it('renders the title as a heading into the root element', async () => {
      await app.render();

      const heading = root.querySelector('h1');
      expect(heading).not.toBeNull();
      expect(heading!.textContent).toBe(App.title);
    });

    it('renders one section per bridge demo', async () => {
      await app.render();

      const titles = [...root.querySelectorAll('section h2')].map(
        (h) => h.textContent,
      );
      expect(titles).toEqual([
        '1. Function call',
        '2. Class with async methods',
        '3. JSON exchange',
        '4. JS callback into Dart',
        '5. Byte array exchange',
      ]);
    });

    it('shows the results of add() and greet()', async () => {
      await app.render();

      expect(sectionText(root, 0)).toBe(
        "add(2, 3) = 5; greet('world') = Hello, world!",
      );
    });

    it('shows the result of the counter class demo', async () => {
      await app.render();

      expect(sectionText(root, 1)).toBe(
        'Counter ended at 20 (live value: 20)',
      );
    });

    it('shows the enriched person as JSON', async () => {
      await app.render();

      expect(JSON.parse(sectionText(root, 2))).toEqual({
        name: 'Alice',
        age: 30,
        isAdult: true,
      });
    });

    it('shows the items mapped by the JS callback', async () => {
      await app.render();

      expect(sectionText(root, 3)).toBe('FOO, BAR, BAZ');
    });

    it('shows the byte analysis as JSON', async () => {
      await app.render();

      expect(JSON.parse(sectionText(root, 4))).toEqual({ byteCount: 5 });
    });

    it('replaces previously rendered content', async () => {
      root.innerHTML = '<p>old content</p>';

      await app.render();

      expect(root.querySelector('p')).toBeNull();
      expect(root.querySelectorAll('section')).toHaveLength(5);
    });
  });
});

/**
 * Reads the result text of the n-th demo section.
 * @param root - The app root element.
 * @param index - Zero-based section index.
 * @returns The text content of the section's `pre` element.
 */
function sectionText(root: HTMLElement, index: number): string {
  const pre = root.querySelectorAll('section pre')[index];
  return pre.textContent ?? '';
}
