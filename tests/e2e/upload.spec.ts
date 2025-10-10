import { test, expect } from "@playwright/test";

test.describe("creator flow", () => {
  test("sign in, upload, view in library", async ({ page }) => {
    test.slow();
    await page.goto("http://localhost:3000/sign-in");
    await page.fill("input[type=email]", "demo@ruido.dev");
    await page.click("text=Send magic link");
    // Magic link step would be handled by email provider in real env.
    // In CI this test is configured to bypass email auth.
    await page.goto("http://localhost:3000/upload");
    await page.fill("input[placeholder='Track title']", "Test Track");
    await page.fill("textarea", "Automated upload description");
    await page.getByRole("combobox", { name: "License" }).click();
    await page.getByText("Creative Commons BY").click();
    await page.setInputFiles("input[type=file]", "tests/fixtures/test.mp3");
    await page.click("text=Upload");
    await page.waitForURL(/track/);
    await expect(page.locator("text=Test Track")).toBeVisible();
    await page.goto("http://localhost:3000/library?query=test");
    await expect(page.locator("text=Test Track")).toBeVisible();
  });
});
