import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const ARTIFACT_PATH = path.resolve('./artifacts/summer-wednesday.png');
const BASE_URL = process.env.E2E_URL || 'http://localhost:4173/index.html';

async function ensureArtifactsDir() {
  const dir = path.dirname(ARTIFACT_PATH);
  await fs.mkdir(dir, { recursive: true });
}

test('Summer Wednesday populated', async ({ page }) => {
  await ensureArtifactsDir();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const summerDetails = page.locator('[data-season="Summer"]');
  await summerDetails.waitFor();
  await summerDetails.evaluate(element => { element.open = true; });

  const wednesdayDetails = page.locator('[data-season="Summer"] [data-day="Wednesday"]');
  await wednesdayDetails.waitFor();
  await wednesdayDetails.evaluate(element => { element.open = true; });

  const firstAct = wednesdayDetails.locator('.act').first();
  await expect(firstAct).toBeVisible();

  await page.screenshot({ path: ARTIFACT_PATH, fullPage: true });
  console.log('SCREENSHOT: ' + ARTIFACT_PATH);
});
