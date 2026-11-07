// Ghi public/version.json truoc moi lan build, de moi nen tang deploy
// deu phuc vu cung 1 ban version.json va AD kiem tra duoc version dang
// chay bang cach mo <domain>/version.json.
// Nguon version duy nhat: package.json. Commit lay tu git, fallback sang
// bien moi truong cua host build (Vercel / Cloudflare Pages / GitHub Actions).
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function git(command, fallback = "") {
  try {
    return execSync(command, { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
      .toString("utf8")
      .trim();
  } catch {
    return fallback;
  }
}

const commit =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  git("git rev-parse HEAD");
const describe = git("git describe --tags --always", commit.slice(0, 7));
const branch =
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.CF_PAGES_BRANCH ||
  process.env.GITHUB_REF_NAME ||
  git("git branch --show-current", "unknown");

const version = {
  name: pkg.name,
  version: pkg.version,
  commit: commit.slice(0, 7),
  commitFull: commit,
  describe,
  branch,
  builtAt: new Date().toISOString(),
};

writeFileSync(
  join(root, "public", "version.json"),
  `${JSON.stringify(version, null, 2)}\n`,
  "utf8",
);
console.log(`version.json: ${version.version} ${version.commit} (${version.branch})`);
