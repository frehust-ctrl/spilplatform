// Build a game and publish it to the Dev channel as a new, immutable version.
//   npm run publish-game -- simfarm [--notes "Hvad er nyt"]
// The version number comes from the game's package.json – bump it for every release.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, SITE, arg, config, fail, loadCatalog, positional, printStatus, readJson, saveCatalog } from "./lib.mjs";

const [slug] = positional();
if (!slug) fail("Angiv et spil, fx: npm run publish-game -- simfarm");
const meta = config().games[slug];
if (!meta) fail(`"${slug}" findes ikke i games.config.json`);

const gameDir = resolve(ROOT, meta.path);
const { version } = readJson(join(gameDir, "package.json"));
const target = join(SITE, "games", slug, version);
if (existsSync(target)) {
  fail(`Version ${version} af ${meta.title} er allerede udgivet – udgivne versioner ændres aldrig.\n  Hæv "version" i ${join(meta.path, "package.json")} og prøv igen.`);
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
