// Point Prod at a version that is already published – by default the one on Dev.
// Nothing is rebuilt: Prod gets exactly the files you tested.
//   npm run promote -- simfarm [--version 0.9.0]

import { existsSync } from "node:fs";
import { join } from "node:path";
import { SITE, arg, fail, findGame, loadCatalog, positional, printStatus, saveCatalog } from "./lib.mjs";

const [slug] = positional();
if (!slug) fail("Angiv et spil, fx: npm run promote -- simfarm");
const catalog = loadCatalog();
const game = findGame(catalog, slug);
const version = arg("version") ?? game.channels.dev;
if (!version) fail("Der er ingen version på Dev at promovere.");
if (!existsSync(join(SITE, "games", slug, version))) fail(`Version ${version} findes ikke.`);
if (game.channels.prod === version) fail(`Prod kører allerede ${version}.`);

const from = game.channels.prod;
game.channels.prod = version;
saveCatalog(catalog);
console.log(`\n✔ ${game.title}: Prod ${from ?? "—"} → ${version}`);
printStatus(game);
console.log(`\n  Husk at deploye: npm run deploy\n`);
