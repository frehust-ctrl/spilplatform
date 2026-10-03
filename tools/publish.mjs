// Build a game and publish it to the Dev channel as a new, immutable version.
//   npm run publish-game -- <spil> [--bump patch|minor|major] [--notes "Hvad er nyt"]
// The version number comes from the game's package.json. --bump raises it for you first
// (patch: 0.9.0 → 0.9.1, minor: 0.9.0 → 0.10.0, major: 0.9.0 → 1.0.0).

import { spawnSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, SITE, arg, config, fail, loadCatalog, positional, printStatus, readJson, saveCatalog, writeJson } from "./lib.mjs";

const [slug] = positional();
if (!slug) fail("Angiv et spil, fx: npm run publish-game -- simfarm");
const meta = config().games[slug];
if (!meta) fail(`"${slug}" findes ikke i games.config.json`);

const gameDir = resolve(ROOT, meta.path);
const pkgPath = join(gameDir, "package.json");
const bump = arg("bump");
if (bump) {
  if (!["patch", "minor", "major"].includes(bump)) fail('--bump skal være "patch", "minor" eller "major"');
  const pkg = readJson(pkgPath);
  const [ma, mi, pa] = pkg.version.split(".").map(Number);
  pkg.version = bump === "major" ? `${ma + 1}.0.0` : bump === "minor" ? `${ma}.${mi + 1}.0` : `${ma}.${mi}.${pa + 1}`;
  writeJson(pkgPath, pkg);
  console.log(`\n▶ Version hævet til ${pkg.version} i ${join(meta.path, "package.json")}`);
}
const { version } = readJson(pkgPath);
const target = join(SITE, "games", slug, version);
if (existsSync(target)) {
  fail(`Version ${version} af ${meta.title} er allerede udgivet – udgivne versioner ændres aldrig.\n  Tilføj --bump patch (eller minor/major), eller hæv "version" i ${join(meta.path, "package.json")}.`);
}

console.log(`\n▶ Bygger ${meta.title} ${version} …`);
const build = spawnSync("npm", ["run", "build"], { cwd: gameDir, stdio: "inherit" });
if (build.status !== 0) fail("Bygget fejlede – intet er udgivet.");

cpSync(join(gameDir, "dist"), target, { recursive: true });
if (meta.cover) cpSync(join(ROOT, meta.cover), join(SITE, meta.cover));

const catalog = loadCatalog();
let game = catalog.games.find((g) => g.slug === slug);
if (!game) {
  game = { slug, channels: { dev: null, prod: null }, versions: [] };
  catalog.games.push(game);
}
// Title, description etc. always follow games.config.json.
Object.assign(game, { title: meta.title, tagline: meta.tagline, description: meta.description, cover: meta.cover, tags: meta.tags ?? [] });
game.versions.unshift({ version, date: new Date().toISOString(), notes: arg("notes") ?? "" });
game.channels.dev = version;
saveCatalog(catalog);

console.log(`\n✔ ${meta.title} ${version} er udgivet til Dev.`);
printStatus(game);
console.log(`\n  Test den, og promovér til Prod med: npm run promote -- ${slug}\n`);
