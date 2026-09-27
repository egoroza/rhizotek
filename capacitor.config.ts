import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "org.rhizotek.app",
  appName: "rhizotek",
  webDir: "build/client",
};

export default config;

// Native platforms are not initialized yet.
// Once the frontend is further along: `pnpm exec cap add ios` / `pnpm exec cap add android`.
