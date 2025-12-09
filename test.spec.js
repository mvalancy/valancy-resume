// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:9051';

test.describe('Resume Server', () => {
  test('homepage loads and shows resume', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check title
    await expect(page).toHaveTitle('Matthew Valancy - Resume');

    // Check resume content is present
    await expect(page.locator('h1')).toContainText('Matthew Valancy');
    await expect(page.locator('text=Hands-On Engineering Lead')).toBeVisible();

    // Check key sections exist
    await expect(page.locator('h2:has-text("Summary")')).toBeVisible();
    await expect(page.locator('h2:has-text("Technical Range")')).toBeVisible();
    await expect(page.locator('h2:has-text("Experience")')).toBeVisible();
    await expect(page.locator('h2:has-text("Education")')).toBeVisible();
  });

  test('download button exists and links to PDF', async ({ page }) => {
    await page.goto(BASE_URL);

    const downloadLink = page.locator('a[href="/download"]');
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toContainText('Download PDF');
  });

  test('PDF download returns valid PDF', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/download`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/pdf');
    expect(response.headers()['content-disposition']).toContain('Matthew_Valancy_Resume.pdf');

    const body = await response.body();
    expect(body.length).toBeGreaterThan(1000); // PDF should have content
    expect(body.slice(0, 5).toString()).toBe('%PDF-'); // PDF magic bytes
  });

  test('/pdf alias works', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/pdf`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/pdf');
  });

  test('/regenerate rebuilds PDF', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/regenerate`);

    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toBe('PDF regenerated');
  });

  test('reload keyboard shortcut is wired up', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check the keydown listener exists
    const hasReloadListener = await page.evaluate(() => {
      return document.body.innerHTML.includes("e.key === 'r'");
    });
    expect(hasReloadListener).toBe(true);
  });

  test('PDF is 2 pages or less', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/download`);
    const pdfBuffer = await response.body();
    const pdfText = pdfBuffer.toString('latin1');

    // Count pages by looking for /Type /Page entries (excluding /Pages)
    const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
    const pageCount = pageMatches ? pageMatches.length : 0;

    expect(pageCount).toBeLessThanOrEqual(2);
    expect(pageCount).toBeGreaterThan(0);
  });

  test('all resume sections render without cutoff', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check each major section has visible content beneath it
    const sections = ['Summary', 'Technical Range', 'Experience', 'Education'];

    for (const section of sections) {
      const header = page.locator(`h2:has-text("${section}")`);
      await expect(header).toBeVisible();

      // Get the next sibling element and verify it has content
      const nextElement = header.locator('~ *').first();
      await expect(nextElement).toBeVisible();
      const text = await nextElement.textContent();
      expect(text.length).toBeGreaterThan(20);
    }

    // Check footer quote made it (last content)
    await expect(page.locator('text=cup is full')).toBeVisible();

    // Check key employers are all visible (not cut off mid-page)
    const employers = ['Monarch Tractor', 'Tesla', 'Astra', 'Desert Star Systems'];
    for (const employer of employers) {
      await expect(page.locator(`text=${employer}`).first()).toBeVisible();
    }
  });
});
