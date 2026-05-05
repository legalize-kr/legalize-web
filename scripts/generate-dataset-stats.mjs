#!/usr/bin/env node
/**
 * Generate website stats from Legalize-KR result repositories.
 *
 * The script reads repository trees, so source repos may be normal worktrees or
 * blobless no-checkout clones. Missing repos are skipped unless --strict is set.
 */

import { execFileSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const WEB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const generatedAt = new Date().toISOString();

const sources = {
  laws: {
    env: "LEGALIZE_LAWS_DIR",
    fallback: "../legalize-kr",
    repo: "legalize-kr/legalize-kr",
  },
  precedents: {
    env: "LEGALIZE_PRECEDENTS_DIR",
    fallback: "../precedent-kr",
    repo: "legalize-kr/precedent-kr",
  },
  ordinances: {
    env: "LEGALIZE_ORDINANCES_DIR",
    fallback: "../ordinance-kr",
    repo: "legalize-kr/ordinance-kr",
  },
  admrules: {
    env: "LEGALIZE_ADMRULES_DIR",
    fallback: "../admrule-kr",
    repo: "legalize-kr/admrule-kr",
  },
};

function resolveSource(source) {
  return resolve(WEB_ROOT, process.env[source.env] || source.fallback);
}

function warnOrThrow(message) {
  if (strict) throw new Error(message);
  console.warn(`Skipping: ${message}`);
}

function runGit(dir, args, encoding = "utf8") {
  return execFileSync("git", ["-C", dir, ...args], {
    encoding,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assertGitRepo(name, dir) {
  if (!existsSync(dir)) {
    warnOrThrow(`${name} source not found at ${dir}`);
    return false;
  }

  try {
    runGit(dir, ["rev-parse", "--git-dir"]);
    return true;
  } catch {
    warnOrThrow(`${name} source is not a git repository: ${dir}`);
    return false;
  }
}

function readRepoFile(dir, filePath) {
  const worktreePath = join(dir, filePath);
  if (existsSync(worktreePath)) {
    return readFileSync(worktreePath, "utf8");
  }
  return runGit(dir, ["show", `HEAD:${filePath}`]);
}

function listRepoFiles(dir) {
  return runGit(dir, ["ls-tree", "-rz", "--name-only", "HEAD"], "buffer")
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

function increment(map, key, amount = 1) {
  if (!key) return;
  map[key] = (map[key] || 0) + amount;
}

function sortObjectByValue(map) {
  return Object.fromEntries(
    Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );
}

function writeJson(fileName, data) {
  writeFileSync(
    join(WEB_ROOT, fileName),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  );
  console.log(`Wrote ${fileName}`);
}

function buildLawStats(dir) {
  const files = listRepoFiles(dir).filter(
    (file) => file.startsWith("kr/") && file.endsWith(".md"),
  );
  const types = {};
  const typeLines = runGit(dir, ["grep", "-h", "^법령구분:", "HEAD", "--", "kr"])
    .split("\n")
    .filter(Boolean);

  for (const line of typeLines) {
    const type = line
      .replace(/^법령구분:\s*/, "")
      .replace(/^['"]|['"]$/g, "")
      .trim();
    increment(types, type);
  }

  return {
    total: files.length,
    amendments: Number(runGit(dir, ["rev-list", "--count", "HEAD"]).trim()),
    types: sortObjectByValue(types),
    generated_at: generatedAt,
    source_repo: sources.laws.repo,
  };
}

function buildPrecedentStats(dir) {
  const caseTypes = {};
  const courts = {};
  const courtsByType = {};
  let total = 0;

  for (const file of listRepoFiles(dir)) {
    if (!file.endsWith(".md") || file === "README.md") continue;

    const parts = file.split("/");
    if (parts.length < 3) continue;

    const [caseType, court] = parts;
    total++;
    increment(caseTypes, caseType);
    increment(courts, court);
    courtsByType[caseType] ||= {};
    increment(courtsByType[caseType], court);
  }

  return {
    total,
    courts: sortObjectByValue(courts),
    case_types: sortObjectByValue(caseTypes),
    courts_by_type: Object.fromEntries(
      Object.entries(courtsByType)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([caseType, value]) => [caseType, sortObjectByValue(value)]),
    ),
    generated_at: generatedAt,
    source_repo: sources.precedents.repo,
  };
}

function buildOrdinanceStats(dir) {
  const types = {};
  const regions = {};
  const localGovernments = {};
  let total = 0;

  for (const file of listRepoFiles(dir)) {
    const parts = file.split("/");
    if (parts.at(-1) !== "본문.md" || parts.length < 5) continue;

    const region = parts[0];
    const localGovernment = parts[1];
    const type = parts.at(-3);
    total++;
    increment(types, type);
    increment(regions, region);
    increment(localGovernments, `${region}/${localGovernment}`);
  }

  return {
    total,
    types: sortObjectByValue(types),
    regions: sortObjectByValue(regions),
    local_governments: sortObjectByValue(localGovernments),
    generated_at: generatedAt,
    source_repo: sources.ordinances.repo,
  };
}

function buildAdmruleStats(dir) {
  const types = {};
  const rootAgencies = {};
  let total = 0;

  for (const file of listRepoFiles(dir)) {
    const parts = file.split("/");
    if (parts.at(-1) !== "본문.md" || parts.length < 4) continue;

    total++;
    increment(rootAgencies, parts[0]);
    increment(types, parts.at(-3));
  }

  return {
    total,
    types: sortObjectByValue(types),
    root_agencies: sortObjectByValue(rootAgencies),
    generated_at: generatedAt,
    source_repo: sources.admrules.repo,
  };
}

const jobs = [
  ["laws", "stats-laws.json", buildLawStats],
  ["precedents", "stats-precedents.json", buildPrecedentStats],
  ["ordinances", "stats-ordinances.json", buildOrdinanceStats],
  ["admrules", "stats-admrules.json", buildAdmruleStats],
];

for (const [name, output, buildStats] of jobs) {
  const dir = resolveSource(sources[name]);
  if (!assertGitRepo(name, dir)) continue;
  writeJson(output, buildStats(dir));
}
