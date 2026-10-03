import { defineConfig } from "vite";

// The portal is built into ../site next to the published games (which must not be wiped).
export default defineConfig({
  base: "./",
  build: { outDir: "../site", emptyOutDir: false, assetsDir: "portal-assets" },
  // In `npm run dev`, serve the published games and catalog from ./site as well.
  publicDir: process.env.SPILPLATFORM_BUILD ? false : "../site",
});
