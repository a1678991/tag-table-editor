import { test, expect } from "@playwright/test";

test("page loads with title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("タグテーブルエディタ");
});

test("preview renders tag cells", async ({ page }) => {
  await page.goto("/");
  const cells = page.locator(".preview-cell");
  await expect(cells.first()).toBeVisible();
  expect(await cells.count()).toBeGreaterThan(0);
});

test("double-click cell enables text editing", async ({ page }) => {
  await page.goto("/");
  const cell = page.locator(".preview-cell").first();
  await cell.dblclick();
  const input = page.locator(".preview-cell-input");
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();
});

test("single-click cell shows color picker", async ({ page }) => {
  await page.goto("/");
  const cell = page.locator(".preview-cell").first();
  await cell.click();
  const picker = page.locator(".picker-dropdown");
  await expect(picker).toBeVisible();
});

test("set switcher tab is visible", async ({ page }) => {
  await page.goto("/");
  const tab = page.locator(".set-tab").first();
  await expect(tab).toBeVisible();
});

test("JSON panel shows valid JSON", async ({ page }) => {
  await page.goto("/");
  const jsonText = await page.locator("pre").textContent();
  expect(jsonText).toBeTruthy();
  const parsed = JSON.parse(jsonText!);
  expect(parsed).toHaveProperty("column_width");
  expect(parsed).toHaveProperty("columns");
});

test("validation badge shows tag count", async ({ page }) => {
  await page.goto("/");
  const badge = page.locator(".badge").first();
  await expect(badge).toContainText("/64");
});
