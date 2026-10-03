// Show every game, its versions and what Dev and Prod point at.
import { loadCatalog } from "./lib.mjs";

const catalog = loadCatalog();
if (!catalog.games.length) console.log("\nIngen spil udgivet endnu.\n");
for (const g of catalog.games) {
  console.log(`\n${g.title} (${g.slug})`);
  console.log(`  Prod: ${g.channels.prod ?? "—"}   Dev: ${g.channels.dev ?? "—"}`);
  for (const v of g.versions) {
    const tags = [g.channels.prod === v.version && "PROD", g.channels.dev === v.version && "DEV"].filter(Boolean).join(" ");
    console.log(`  ${v.version.padEnd(10)} ${v.date.slice(0, 10)}  ${tags.padEnd(8)} ${v.notes}`);
  }
}
console.log("");
