import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3100",
    launchOptions: { executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" },
  },
  reporter: "line",
});
