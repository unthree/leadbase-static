import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";

test("login renders and enters the app", async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening), Maya/ })).toBeVisible();
  await expect(page.getByText("Opportunity score")).toBeVisible();
  await expect(page.getByText("Agent activity")).toBeVisible();
});

test("golden path: feed → build → portfolio → builder → agent", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  // Feed
  await page.goto(`${BASE}/feed`);
  await expect(page.getByRole("heading", { name: "Opportunity Feed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Onboarding teardown service for seed SaaS" })).toBeVisible();

  // Tab filter
  await page.getByRole("tab", { name: /Local/ }).click();
  await expect(page.getByRole("heading", { name: "Local HVAC lead-gen microsite network" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Onboarding teardown service for seed SaaS" })).toHaveCount(0);
  await page.getByRole("tab", { name: /All/ }).click();
  // Wait for the unfiltered feed to re-render before acting on the first card.
  await expect(page.getByRole("heading", { name: "Onboarding teardown service for seed SaaS" })).toBeVisible();

  // Build modal → confirm (first card is the featured Onboarding opportunity)
  await page.getByRole("button", { name: "Build micro-business" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("What your agent will do")).toBeVisible();
  await page.getByRole("button", { name: "Build it" }).click();

  // Portfolio — new card appears (optimistic build)
  await page.waitForURL("**/portfolio");
  await expect(page.getByRole("heading", { name: "Portfolio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Onboarding teardown/ })).toBeVisible();

  // Builder
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.waitForURL("**/builder/**");
  await expect(page.getByRole("heading", { name: "Assets" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Buyer leads" })).toBeVisible();

  // Agent workspace — send a chat, see it echoed
  await page.goto(`${BASE}/agent`);
  await expect(page.getByText("Agent Workspace")).toBeVisible();
  await expect(page.getByText("Tasks running")).toBeVisible();
  await page.getByPlaceholder("Ask your agent to build, research, or launch…").fill("Find me more SaaS buyers");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Find me more SaaS buyers")).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});
