// Point Prod back at an earlier version.
//   npm run rollback -- simfarm            (the version before the current one)
//   npm run rollback -- simfarm --version 0.8.0

import { arg, fail, findGame, loadCatalog, positional, printStatus, saveCatalog } from "./lib.mjs";

const [slug] = positional();
if (!slug) fail("Angiv et spil, fx: npm run rollback -- simfarm");
const catalog = loadCatalog();
const game = findGame(catalog, slug);
const current = game.channels.prod;
const versions = game.versions.map((v) => v.version);
const version = arg("version") ?? versions[versions.indexOf(current) + 1];
if (!version || !versions.includes(version)) fail(`Ingen tidligere version at rulle tilbage til (Prod er ${current ?? "—"}).`);

game.channels.prod = version;
saveCatalog(catalog);
console.log(`\n↩ ${game.title}: Prod ${current} → ${version}`);
printStatus(game);
console.log(`\n  Husk at deploye: npm run deploy\n`);
