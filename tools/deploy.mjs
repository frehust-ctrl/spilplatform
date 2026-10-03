// Publish ./site to GitHub Pages (the gh-pages branch).
//   npm run deploy
// ./site must be a git worktree of the gh-pages branch – see README ("Første gang").

import { spawnSync } from "node:child_process";
import { ROOT, SITE, fail } from "./lib.mjs";

const git = (args, cwd = SITE) => spawnSync("git", args, { cwd, encoding: "utf8" });

const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
if (branch.status !== 0 || branch.stdout.trim() !== "gh-pages") {
  fail("site/ er ikke sat op som gh-pages-grenen endnu. Følg 'Første gang' i README.md.");
}
const remote = git(["remote", "get-url", "origin"], ROOT);
if (remote.status !== 0) fail("Repoet har ingen GitHub-remote (origin) endnu. Følg 'Første gang' i README.md.");

const build = spawnSync("node", ["tools/build-portal.mjs"], { cwd: ROOT, stdio: "inherit" });
if (build.status !== 0) fail("Portalen kunne ikke bygges – intet er deployet.");

git(["add", "-A"]);
if (git(["diff", "--cached", "--quiet"]).status === 0) {
  console.log("Intet nyt at deploye.");
  process.exit(0);
}
const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
const commit = git(["commit", "-m", `Deploy ${stamp}`]);
if (commit.status !== 0) fail(commit.stderr);
const push = spawnSync("git", ["push", "origin", "gh-pages"], { cwd: SITE, stdio: "inherit" });
if (push.status !== 0) fail("Push fejlede.");
console.log(`\n✔ Deployet til GitHub Pages (${remote.stdout.trim()})\n`);
