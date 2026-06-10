// @license
// Copyright (c) 2026 tssuite
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import type { DartBridge } from '@tssuite/gg-bridge-dart-typescript';

/**
 * One demo block rendered by the app: a heading plus the formatted
 * result of the bridge calls it exercises.
 */
interface DemoResult {
  /**
   * Section heading shown above the result.
   */
  title: string;

  /**
   * The formatted result of the bridge call.
   */
  text: string;
}

/**
 * Coordinates state, rendering and DOM event wiring for the app.
 *
 * Calls every method exposed by the Dart bridge and renders the
 * results. The class is instantiated by `main.ts`; tests can construct
 * it directly with stub DOM nodes and a stub bridge.
 */
export class App {
  /**
   * The title shown in the welcome view.
   */
  static readonly title = 'Bridge TypeScript';

  /**
   * Constructor
   * @param root - The element the app renders into.
   * @param bridge - The initialized Dart bridge whose methods are demoed.
   */
  constructor(
    private readonly root: HTMLElement,
    private readonly bridge: DartBridge,
  ) {}

  /**
   * Calls all bridge methods and renders their results into the root
   * element.
   */
  async render(): Promise<void> {
    const heading = document.createElement('h1');
    heading.textContent = App.title;

    const sections = (await this.runDemos()).map((demo, index) =>
      App.section(`${index + 1}. ${demo.title}`, demo.text),
    );

    this.root.replaceChildren(heading, ...sections);
  }

  // ######################
  // Private
  // ######################

  /**
   * Exercises every method of the Dart bridge.
   * @returns One formatted result per demo.
   */
  private async runDemos(): Promise<DemoResult[]> {
    const bridge = this.bridge;

    const counter = bridge.createCounter(10);
    counter.increment(); // 11
    counter.increment(4); // 15
    const final = await counter.incrementAsync(5, 5); // 20

    return [
      {
        title: 'Function call',
        text:
          `add(2, 3) = ${bridge.add(2, 3)}; ` +
          `greet('world') = ${bridge.greet('world')}`,
      },
      {
        title: 'Class with async methods',
        text: `Counter ended at ${final} (live value: ${counter.value})`,
      },
      {
        title: 'JSON exchange',
        text: JSON.stringify(
          bridge.enrichPerson({ name: 'Alice', age: 30 }),
          null,
          2,
        ),
      },
      {
        title: 'JS callback into Dart',
        text: bridge
          .mapWithCallback(['foo', 'bar', 'baz'], (s) => s.toUpperCase())
          .join(', '),
      },
      {
        title: 'Byte array exchange',
        text: JSON.stringify(
          bridge.analyzeBytes(new Uint8Array([1, 2, 3, 4, 5])),
          null,
          2,
        ),
      },
    ];
  }

  /**
   * Builds one output section.
   * @param title - The section heading.
   * @param text - The preformatted result text.
   * @returns The assembled section element.
   */
  private static section(title: string, text: string): HTMLElement {
    const section = document.createElement('section');
    const heading = document.createElement('h2');
    heading.textContent = title;
    const pre = document.createElement('pre');
    pre.textContent = text;
    section.append(heading, pre);
    return section;
  }
}
