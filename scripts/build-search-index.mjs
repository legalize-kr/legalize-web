/**
 * Build Pagefind search index from sharded image data.
 *
 * Reads all shard-*.json files from public/data/images/ and creates
 * a searchable index with image_id, law names, and OCR text.
 *
 * Usage: node scripts/build-search-index.mjs
 */

import * as pagefind from "pagefind";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const DATA_DIR = "public/data/images";
const OUTPUT_DIR = "_site/pagefind";

const shardFiles = readdirSync(DATA_DIR)
  .filter((f) => f.startsWith("shard-") && f.endsWith(".json"))
  .sort();

console.log(`Found ${shardFiles.length} shard files`);

const { index } = await pagefind.createIndex();
let count = 0;

for (const file of shardFiles) {
  const entries = JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
  for (const entry of entries) {
    const lawNames = entry.refs.map((r) => r.law_name).join(" ");
    const content = [
      entry.image_id,
      lawNames,
      entry.converted_text || "",
    ].join(" ");

    await index.addCustomRecord({
      url: `/images/#${entry.image_id}`,
      content,
      language: "ko",
      meta: {
        title: `${entry.image_id} — ${entry.refs[0]?.law_name || ""}`,
        image_id: entry.image_id,
        status: entry.status,
      },
    });
    count++;
  }
}

console.log(`Indexed ${count} images`);

const { errors } = await index.writeFiles({ outputPath: OUTPUT_DIR });
if (errors.length) {
  console.error("Pagefind errors:", errors);
  process.exit(1);
}

console.log(`Search index written to ${OUTPUT_DIR}/`);
await pagefind.close();
