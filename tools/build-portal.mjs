// Build the portal (catalog + player) into ./site without touching the published games.
import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, SITE, fail } from "./lib.mjs";

rmSync(join(SITE, "portal-assets"), { recursive: true, force: true });
// publicDir is only for the dev server; skip copying it into itself on build.
const r = spawnSync("npx", ["vite", "build", "portal", "--config", "portal/vite.config.ts", "--emptyOutDir", "false"], {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, SPILPLATFORM_BUILD: "1" },
});
if (r.status !== 0) fail("Portalen kunne ikke bygges.");
writeFileSync(join(SITE, ".nojekyll"), ""); // GitHub Pages: serve files as they are
console.log("✔ Portal bygget til site/");
