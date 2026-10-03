// Change the release notes of a published version. Only the description changes – never the files.
//   npm run notes -- bondegaarden --version 0.9.3 --notes "Hvad er nyt"
//   (without --version: the newest version)

import { arg, fail, findGame, loadCatalog, positional, saveCatalog } from "./lib.mjs";

const [slug] = positional();
const notes = arg("notes");
if (!slug || notes === undefined) fail('Brug: npm run notes -- <spil> [--version x.y.z] --notes "Hvad er nyt"');
const catalog = loadCatalog();
const game = findGame(catalog, slug);
const version = arg("version") ?? game.versions[0]?.version;
const entry = game.versions.find((v) => v.version === version);
if (!entry) fail(`Version ${version} findes ikke.`);
const before = entry.notes;
if (before === notes) {
  console.log(`\n= ${game.title} ${version} har allerede den note – intet ændret.\n`);
  process.exit(0);
}
entry.notes = notes;
saveCatalog(catalog);
console.log(`\n✔ ${game.title} ${version}: "${before}" → "${notes}"\n  Husk at deploye: npm run deploy\n`);
