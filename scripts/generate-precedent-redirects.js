#!/usr/bin/env node
/**
 * Generate meta-refresh redirect HTML pages for old precedent URLs.
 *
 * Reads legacy-paths.json and emits static HTML redirect pages into
 * _site/precedent/ so that old /precedent/{caseno}/ URLs transparently
 * redirect to the new /precedent/{court}__{date}__{caseno}/ URLs.
 *
 * GitHub Pages does not support server-side _redirects (Netlify-only),
 * so meta-refresh + canonical link is used instead.
 *
 * N:1 fan-out: when multiple new_path entries share one old_path,
 * the entry with the lowest 판례일련번호 (string sort ASC) wins.
 *
 * Usage:
 *   node scripts/generate-precedent-redirects.js
 *   node scripts/generate-precedent-redirects.js --legacy-paths <file> --site-dir <dir>
 */

"use strict";

const fs = require("fs");
const path = require("path");

const SITE_BASE_URL = "https://legalize.kr";
const PRECEDENT_PREFIX = "/precedent";

function pathToUrl(filePath) {
  const stem = filePath.replace(/\.md$/, "");
  return `${PRECEDENT_PREFIX}/${stem}/`;
}

function makeRedirectHtml(newUrl) {
  const fullNewUrl = `${SITE_BASE_URL}${newUrl}`;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=${newUrl}">
<link rel="canonical" href="${fullNewUrl}">
<title>이동 중…</title>
<script>window.location.replace("${newUrl}");</script>
</head>
<body>
<p>이 페이지는 <a href="${newUrl}">새 주소</a>로 이동했습니다.</p>
</body>
</html>
`;
}

/**
 * @param {string} siteDir   - Path to the Eleventy output dir (e.g. _site)
 * @param {string} legacyPathsFile - Path to legacy-paths.json
 * @returns {{ generated: number, skipped: number, fanOutDuplicates: number }}
 */
function generateRedirects(siteDir, legacyPathsFile) {
  if (!fs.existsSync(legacyPathsFile)) {
    console.log(`[redirects] ${legacyPathsFile} not found — skipping`);
    return { generated: 0, skipped: 0, fanOutDuplicates: 0 };
  }

  const entries = JSON.parse(fs.readFileSync(legacyPathsFile, "utf-8"));

  // Sort by 판례일련번호 ASC for deterministic N:1 fan-out resolution
  entries.sort((a, b) =>
    String(a["판례일련번호"]).localeCompare(String(b["판례일련번호"]))
  );

  // Build old_path → first new_path map (first entry wins in N:1 fan-out)
  const redirectMap = new Map();
  let fanOutDuplicates = 0;
  for (const entry of entries) {
    if (!entry.old_path) continue; // null = 신규 record, no redirect needed
    if (redirectMap.has(entry.old_path)) {
      fanOutDuplicates++;
      continue; // N:1 fan-out: first (lowest serial) wins
    }
    redirectMap.set(entry.old_path, entry.new_path);
  }

  const skipped = entries.filter((e) => !e.old_path).length;
  let generated = 0;

  for (const [oldPath, newPath] of redirectMap) {
    const newUrl = pathToUrl(newPath);
    const stem = oldPath.replace(/\.md$/, "");
    // e.g. _site/precedent/민사/대법원/2022다12345/index.html
    const outFile = path.join(
      siteDir,
      "precedent",
      ...stem.split("/"),
      "index.html"
    );

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, makeRedirectHtml(newUrl), "utf-8");
    generated++;
  }

  console.log(
    `[redirects] generated=${generated} skipped(null)=${skipped} fan-out-dup=${fanOutDuplicates}`
  );
  return { generated, skipped, fanOutDuplicates };
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const siteDirIdx = args.indexOf("--site-dir");
  const legacyIdx = args.indexOf("--legacy-paths");

  const siteDir =
    siteDirIdx !== -1
      ? args[siteDirIdx + 1]
      : path.join(__dirname, "..", "_site");
  const legacyPathsFile =
    legacyIdx !== -1
      ? args[legacyIdx + 1]
      : path.join(__dirname, "..", "legacy-paths.json");

  generateRedirects(siteDir, legacyPathsFile);
}

module.exports = { generateRedirects };
