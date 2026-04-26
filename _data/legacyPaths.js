"use strict";

const fs = require("fs");
const path = require("path");

// Expose legacy-paths.json as Eleventy global data (available as `legacyPaths` in templates).
// Used by sitemap.njk to emit new precedent URLs into the sitemap.
// Returns [] if file does not exist yet (pre-Phase 5 builds).
const FILE = path.join(__dirname, "..", "legacy-paths.json");

module.exports = fs.existsSync(FILE)
  ? JSON.parse(fs.readFileSync(FILE, "utf-8"))
  : [];
