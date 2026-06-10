// @license
// Copyright (c) 2026 tssuite
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { expect, test } from '@playwright/test';

test('shows the app title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Bridge TypeScript');
});

test('renders the results of all bridge demos', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  await page.goto('/');

  const pre = (index: number) =>
    page.locator('section pre').nth(index);

  await expect(pre(0)).toHaveText(
    "add(2, 3) = 5; greet('world') = Hello, world!",
  );

  await expect(pre(1)).toHaveText('Counter ended at 20 (live value: 20)');

  await expect(pre(2)).toContainText('"name": "Alice"');
  await expect(pre(2)).toContainText('"age": 30');
  await expect(pre(2)).toContainText('"isAdult": true');

  await expect(pre(3)).toHaveText('FOO, BAR, BAZ');

  await expect(pre(4)).toContainText('"byteCount": 5');

  expect(pageErrors).toEqual([]);
});
