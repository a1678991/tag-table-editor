import { test, expect } from "@playwright/test";

// Clear localStorage before each test for isolation
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

// ============================================================
// User Journey 1: First visit — load template and explore
// ============================================================
test.describe("Journey: First visit", () => {
  test("page loads with Japanese title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("タグテーブルエディタ");
  });

  test("default template renders tag cells in preview", async ({ page }) => {
    await page.goto("/");
    const cells = page.locator(".preview-cell");
    await expect(cells.first()).toBeVisible();
    expect(await cells.count()).toBeGreaterThan(0);
  });

  test("validation badge shows tag count out of 64", async ({ page }) => {
    await page.goto("/");
    const badge = page.locator(".badge").first();
    await expect(badge).toContainText("/64");
  });

  test("JSON panel shows valid tag table JSON", async ({ page }) => {
    await page.goto("/");
    const jsonText = await page.locator("pre").textContent();
    expect(jsonText).toBeTruthy();
    const parsed = JSON.parse(jsonText!);
    expect(parsed).toHaveProperty("column_width");
    expect(parsed).toHaveProperty("columns");
    expect(parsed.columns.length).toBeGreaterThan(0);
    expect(parsed.columns[0]).toHaveProperty("cells");
  });

  test("set tab is visible with a generated name", async ({ page }) => {
    await page.goto("/");
    const tab = page.locator(".set-tab[role='tab']").first();
    await expect(tab).toBeVisible();
    const name = await tab.locator(".set-tab-name").textContent();
    expect(name).toBeTruthy();
    // Random names have format: word-word-word
    expect(name).toMatch(/.+-/);
  });
});

// ============================================================
// Journey 2: Edit text — double-click to inline edit
// ============================================================
test.describe("Journey: Edit cell text", () => {
  test("double-click cell switches to text input", async ({ page }) => {
    await page.goto("/");
    const cell = page.locator(".preview-cell").first();
    const originalText = await cell.textContent();
    await cell.dblclick();

    const input = page.locator(".preview-cell-input");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue(originalText!.trim());
  });

  test("typing updates text and JSON reflects change", async ({ page }) => {
    await page.goto("/");
    const cell = page.locator(".preview-cell").first();
    await cell.dblclick();

    const input = page.locator(".preview-cell-input");
    await input.fill("テスト入力");
    await input.press("Enter");

    // Cell shows new text
    await expect(page.locator(".preview-cell").first()).toContainText("テスト入力");

    // JSON reflects the change
    const jsonText = await page.locator("pre").textContent();
    expect(jsonText).toContain("テスト入力");
  });

  test("pressing Escape exits edit mode", async ({ page }) => {
    await page.goto("/");
    const cell = page.locator(".preview-cell").first();
    await cell.dblclick();

    const input = page.locator(".preview-cell-input");
    await expect(input).toBeVisible();
    await input.press("Escape");

    await expect(input).not.toBeVisible();
    await expect(page.locator(".preview-cell").first()).toBeVisible();
  });
});

// ============================================================
// Journey 3: Change colors — single-click to open color picker
// ============================================================
test.describe("Journey: Change cell colors", () => {
  test("single-click cell opens color picker dropdown", async ({ page }) => {
    await page.goto("/");
    const cell = page.locator(".preview-cell").first();
    await cell.click();

    const picker = page.locator(".picker-dropdown");
    await expect(picker).toBeVisible();
    await expect(picker.locator(".picker-label")).toHaveCount(2);
  });

  test("color picker has bg and text color sections", async ({ page }) => {
    await page.goto("/");
    await page.locator(".preview-cell").first().click();

    const labels = page.locator(".picker-label");
    await expect(labels.nth(0)).toContainText("背景");
    await expect(labels.nth(1)).toContainText("文字");
  });

  test("clicking outside closes color picker", async ({ page }) => {
    await page.goto("/");
    await page.locator(".preview-cell").first().click();
    await expect(page.locator(".picker-dropdown")).toBeVisible();

    // Click on the preview stage background
    await page.locator(".preview-stage").click({ position: { x: 5, y: 5 } });
    await expect(page.locator(".picker-dropdown")).not.toBeVisible();
  });
});

// ============================================================
// Journey 4: Manage multiple sets
// ============================================================
test.describe("Journey: Multiple tag sets", () => {
  test("create new blank set via + button", async ({ page }) => {
    await page.goto("/");
    const initialTabs = await page.locator(".set-tab[role='tab']").count();

    // Click + to create a blank set
    await page.locator(".add-tab").click();

    const newTabs = await page.locator(".set-tab[role='tab']").count();
    expect(newTabs).toBe(initialTabs + 1);
  });

  test("switch between sets changes preview content", async ({ page }) => {
    await page.goto("/");

    // Create a new blank set
    await page.locator(".add-tab").click();

    // Blank set should have fewer cells
    const blankCells = await page.locator(".preview-cell").count();

    // Switch back to first tab
    await page.locator(".set-tab[role='tab']").first().click();
    const originalCells = await page.locator(".preview-cell").count();

    expect(originalCells).toBeGreaterThan(blankCells);
  });

  test("double-click tab enables rename", async ({ page }) => {
    await page.goto("/");
    const tab = page.locator(".set-tab[role='tab']").first();
    await tab.dblclick();

    const renameInput = page.locator(".rename-input");
    await expect(renameInput).toBeVisible();
  });

  test("delete set removes tab", async ({ page }) => {
    await page.goto("/");

    // Create a second set first
    await page.locator(".add-tab").click();
    const tabsAfterCreate = await page.locator(".set-tab[role='tab']").count();

    // Delete the active set
    await page.locator(".set-tab-close").last().click();
    const tabsAfterDelete = await page.locator(".set-tab[role='tab']").count();
    expect(tabsAfterDelete).toBe(tabsAfterCreate - 1);
  });

  test("right-click tab shows context menu", async ({ page }) => {
    await page.goto("/");
    const tab = page.locator(".set-tab[role='tab']").first();
    await tab.click({ button: "right" });

    const menu = page.locator(".set-tab-context-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByText("複製")).toBeVisible();
    await expect(menu.getByText("リネーム")).toBeVisible();
  });

  test("right-click duplicate creates a copy of the set", async ({ page }) => {
    await page.goto("/");
    const initialTabs = await page.locator(".set-tab[role='tab']").count();
    const originalCells = await page.locator(".preview-cell").count();

    // Right-click the first tab and duplicate
    const tab = page.locator(".set-tab[role='tab']").first();
    await tab.click({ button: "right" });
    await page.locator(".set-tab-context-menu").getByText("複製").click();

    // Should have one more tab
    const newTabs = await page.locator(".set-tab[role='tab']").count();
    expect(newTabs).toBe(initialTabs + 1);

    // Duplicated set should have the same number of cells
    const duplicatedCells = await page.locator(".preview-cell").count();
    expect(duplicatedCells).toBe(originalCells);
  });

  test("right-click rename opens rename input", async ({ page }) => {
    await page.goto("/");
    const tab = page.locator(".set-tab[role='tab']").first();
    await tab.click({ button: "right" });
    await page.locator(".set-tab-context-menu").getByText("リネーム").click();

    await expect(page.locator(".rename-input")).toBeVisible();
  });

  test("right-click delete removes the tab", async ({ page }) => {
    await page.goto("/");

    // Create a second set first
    await page.locator(".add-tab").click();
    const tabsAfterCreate = await page.locator(".set-tab[role='tab']").count();

    // Right-click the first tab and delete
    const tab = page.locator(".set-tab[role='tab']").first();
    await tab.click({ button: "right" });
    await page.locator(".set-tab-context-menu").getByText("削除").click();

    const tabsAfterDelete = await page.locator(".set-tab[role='tab']").count();
    expect(tabsAfterDelete).toBe(tabsAfterCreate - 1);
  });

  test("tabs have draggable attribute for reordering", async ({ page }) => {
    await page.goto("/");
    await page.locator(".add-tab").click();

    const tabs = page.locator(".set-tab[role='tab']");
    await expect(tabs.nth(0)).toHaveAttribute("draggable", "true");
    await expect(tabs.nth(1)).toHaveAttribute("draggable", "true");
  });

  test("reordering sets changes tab order", async ({ page }) => {
    await page.goto("/");
    await page.locator(".add-tab").click();

    const tabs = page.locator(".set-tab[role='tab']");
    const firstName = await tabs.nth(0).locator(".set-tab-name").textContent();
    const secondName = await tabs.nth(1).locator(".set-tab-name").textContent();

    // Reorder via localStorage (simulates moveSet result) and reload
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      const raw = localStorage.getItem("tag-table-editor-v2");
      const stored = JSON.parse(raw!);
      const keys = Object.keys(stored.sets);
      const reordered: Record<string, unknown> = {};
      for (const k of keys.reverse()) reordered[k] = stored.sets[k];
      stored.sets = reordered;
      localStorage.setItem("tag-table-editor-v2", JSON.stringify(stored));
    });
    await page.reload();

    await expect(tabs.nth(0).locator(".set-tab-name")).toHaveText(secondName!);
    await expect(tabs.nth(1).locator(".set-tab-name")).toHaveText(firstName!);
  });

  test("context menu closes on outside click", async ({ page }) => {
    await page.goto("/");
    const tab = page.locator(".set-tab[role='tab']").first();
    await tab.click({ button: "right" });

    await expect(page.locator(".set-tab-context-menu")).toBeVisible();

    // Click outside to close
    await page.locator("body").click();
    await expect(page.locator(".set-tab-context-menu")).not.toBeVisible();
  });
});

// ============================================================
// Journey 5: Export JSON for Unity engineer
// ============================================================
test.describe("Journey: Export JSON", () => {
  test("copy button copies JSON to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    await page.getByText("コピー").click();
    await expect(page.getByText("OK!")).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const parsed = JSON.parse(clipboardText);
    expect(parsed).toHaveProperty("columns");
  });

  test("JSON output matches Unity schema", async ({ page }) => {
    await page.goto("/");
    const jsonText = await page.locator("pre").textContent();
    const parsed = JSON.parse(jsonText!);

    // Must have column_width (float)
    expect(typeof parsed.column_width).toBe("number");

    // Each column must have cells array
    for (const col of parsed.columns) {
      expect(Array.isArray(col.cells)).toBe(true);
      for (const cell of col.cells) {
        expect(cell).toHaveProperty("text");
        expect(cell).toHaveProperty("text_color");
        expect(cell).toHaveProperty("bg_color");
        // Colors must be #RRGGBB format
        expect(cell.text_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(cell.bg_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
});

// ============================================================
// Journey 6: Persistence — close and return
// ============================================================
test.describe("Journey: Persistence", () => {
  test("edits persist across page reload", async ({ page }) => {
    await page.goto("/");

    // Edit first cell text
    const cell = page.locator(".preview-cell").first();
    await cell.dblclick();
    const input = page.locator(".preview-cell-input");
    await input.fill("永続化テスト");
    await input.press("Enter");

    // Wait for auto-save debounce
    await page.waitForTimeout(700);

    // Reload
    await page.reload();

    // Verify edit persisted
    await expect(page.locator(".preview-cell").first()).toContainText("永続化テスト");
  });

  test("tab order persists across reload", async ({ page }) => {
    await page.goto("/");

    // Create a second set
    await page.locator(".add-tab").click();
    await page.waitForTimeout(700);

    const tabs = page.locator(".set-tab[role='tab']");
    const firstName = await tabs.nth(0).locator(".set-tab-name").textContent();
    const secondName = await tabs.nth(1).locator(".set-tab-name").textContent();

    // Reorder via localStorage and reload to set up the reordered state
    await page.evaluate(() => {
      const raw = localStorage.getItem("tag-table-editor-v2");
      const stored = JSON.parse(raw!);
      const keys = Object.keys(stored.sets);
      const reordered: Record<string, unknown> = {};
      for (const k of keys.reverse()) reordered[k] = stored.sets[k];
      stored.sets = reordered;
      localStorage.setItem("tag-table-editor-v2", JSON.stringify(stored));
    });
    await page.reload();

    // Verify reorder persisted
    await expect(tabs.nth(0).locator(".set-tab-name")).toHaveText(secondName!);
    await expect(tabs.nth(1).locator(".set-tab-name")).toHaveText(firstName!);

    // Reload again to verify it persists across multiple visits
    await page.reload();
    await expect(tabs.nth(0).locator(".set-tab-name")).toHaveText(secondName!);
    await expect(tabs.nth(1).locator(".set-tab-name")).toHaveText(firstName!);
  });

  test("active set persists across reload", async ({ page }) => {
    await page.goto("/");

    // Create second set
    await page.locator(".add-tab").click();

    // Wait for auto-save
    await page.waitForTimeout(700);

    // Get active tab name
    const activeTab = page.locator(".set-tab.active .set-tab-name");
    const activeName = await activeTab.textContent();

    // Reload
    await page.reload();

    // Same set should be active
    const reloadedActiveTab = page.locator(".set-tab.active .set-tab-name");
    await expect(reloadedActiveTab).toContainText(activeName!);
  });
});

// ============================================================
// Journey 7: Editor panel toggle
// ============================================================
test.describe("Journey: Editor panel", () => {
  test("editor panel is hidden by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=エディタ").first()).toBeVisible();
    // EditorPanel heading should not be visible
    await expect(page.locator("h2", { hasText: "エディタ" }).locator("visible=true")).toHaveCount(
      0,
    );
  });

  test("clicking エディタ button shows editor panel", async ({ page }) => {
    await page.goto("/");
    await page.locator(".navbar button", { hasText: "エディタ" }).click();

    // Editor panel heading should appear
    await expect(page.locator("h2", { hasText: "エディタ" })).toBeVisible();
  });
});

// ============================================================
// Journey 8: Undo / Redo
// ============================================================
test.describe("Journey: Undo / Redo", () => {
  test("undo reverts text edit", async ({ page }) => {
    await page.goto("/");
    const cell = page.locator(".preview-cell").first();
    const originalText = (await cell.textContent())!.trim();

    // Edit text
    await cell.dblclick();
    const input = page.locator(".preview-cell-input");
    await input.fill("変更テスト");
    await input.press("Enter");
    await expect(page.locator(".preview-cell").first()).toContainText("変更テスト");

    // Undo
    await page.keyboard.press("Control+z");
    await expect(page.locator(".preview-cell").first()).toContainText(originalText);
  });

  test("redo restores undone change", async ({ page }) => {
    await page.goto("/");
    const cell = page.locator(".preview-cell").first();

    // Edit text
    await cell.dblclick();
    const input = page.locator(".preview-cell-input");
    await input.fill("やり直しテスト");
    await input.press("Enter");

    // Undo then redo
    await page.keyboard.press("Control+z");
    await page.keyboard.press("Control+Shift+z");
    await expect(page.locator(".preview-cell").first()).toContainText("やり直しテスト");
  });

  test("undo reverts cell deletion", async ({ page }) => {
    await page.goto("/");
    const initialCount = await page.locator(".preview-cell").count();

    // Delete a cell via color picker
    await page.locator(".preview-cell").first().click();
    await page.getByText("このセルを削除").click();

    const afterDelete = await page.locator(".preview-cell").count();
    expect(afterDelete).toBe(initialCount - 1);

    // Undo
    await page.keyboard.press("Control+z");
    const afterUndo = await page.locator(".preview-cell").count();
    expect(afterUndo).toBe(initialCount);
  });

  test("undo button is disabled when no history", async ({ page }) => {
    await page.goto("/");
    const undoBtn = page.locator("button[title='元に戻す (Ctrl+Z)']");
    await expect(undoBtn).toBeDisabled();
  });

  test("undo button becomes enabled after mutation", async ({ page }) => {
    await page.goto("/");
    const undoBtn = page.locator("button[title='元に戻す (Ctrl+Z)']");
    await expect(undoBtn).toBeDisabled();

    // Add a column to create history
    await page.locator(".add-col-btn").click();
    // Need to wait for reactivity
    await expect(undoBtn).toBeEnabled();
  });
});
