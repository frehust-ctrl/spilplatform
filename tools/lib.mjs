// Shared helpers for the platform tools. The built site lives in ./site – that folder is what
// GitHub Pages serves (it is the gh-pages branch once deployed).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SITE = join(ROOT, "site");
export const CATALOG = join(SITE, "catalog.json");

export const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
export function writeJson(p, data) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

export const config = () => readJson(join(ROOT, "games.config.json"));

/** The catalog the portal reads: every game, its versions, and which version each channel points at. */
export function loadCatalog() {
  if (!existsSync(CATALOG)) return { updated: null, games: [] };
  return readJson(CATALOG);
}

export function saveCatalog(catalog) {
  catalog.updated = new Date().toISOString();
  catalog.platform = config().platform;
  writeJson(CATALOG, catalog);
}

export function findGame(catalog, slug) {
  const game = catalog.games.find((g) => g.slug === slug);
  if (!game) fail(`Spillet "${slug}" er ikke udgivet endnu. Brug: npm run publish-game -- ${slug}`);
  return game;
}

export function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

export function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

export const positional = () => process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && !all[i - 1]?.startsWith("--"));

export function printStatus(game) {
  console.log(`  ${game.title} (${game.slug})`);
  console.log(`    Prod: ${game.channels.prod ?? "—"}    Dev: ${game.channels.dev ?? "—"}`);
  console.log(`    Versioner: ${game.versions.map((v) => v.version).join(", ")}`);
}
