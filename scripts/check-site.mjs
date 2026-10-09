#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "analyse.html", "fallwerkstatt.html"];
const sources = JSON.parse(readFileSync(resolve(root, "data/sources.json"), "utf8"));
const manifest = readFileSync(resolve(root, "quellen/manifest.csv"), "utf8");
const report = [];

function ids(html) {
  const seen = new Set();
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    assert(!seen.has(match[1]), "Doppelte ID: " + match[1]);
    seen.add(match[1]);
  }
  return seen;
}

for (const page of pages) {
  const html = readFileSync(resolve(root, page), "utf8");
  assert(html.includes('<html lang="de">'), page + ": Sprachattribut fehlt");
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, page + ": genau ein h1 erwartet");
  assert(html.includes('<main'), page + ": main fehlt");
  const pageIds = ids(html);
  let links = 0;
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = m[1];
    if (/^(?:https?:|mailto:|data:)/.test(href)) continue;
    const [path, fragment] = href.split("#");
    const targetPath = path || page;
    const full = resolve(root, targetPath);
    assert(full.startsWith(root + "/"), page + ": unzulässiger relativer Pfad: " + href);
    assert(existsSync(full), page + ": nicht vorhandenes Link-/Asset-Ziel: " + href);
    if (fragment) {
      const targetIds = targetPath === page ? pageIds : ids(readFileSync(full, "utf8"));
      assert(targetIds.has(decodeURIComponent(fragment)), page + ": fehlender Anker: " + href);
    }
    links++;
  }
  report.push(page + ": " + pageIds.size + " IDs, " + links + " geprüfte interne Links/Assets");
}

const index = readFileSync(resolve(root, "index.html"), "utf8");
const analysis = readFileSync(resolve(root, "analyse.html"), "utf8");
const chapters = ["okja", "beziehung", "beduerfnisse", "kommunikation", "konzept", "praevention", "schutz", "pruefung"];
for (const id of chapters) {
  assert(analysis.includes('id="' + id + '"'), "Themenkapitel fehlt: " + id);
  assert(index.includes('href="analyse.html#' + id + '"'), "Startseiten-Verweis fehlt: " + id);
}
assert.equal(sources.sources.length, 15, "Es sollen 15 Quellengruppen enthalten sein");
const allFiles = sources.sources.flatMap((source) => source.boardFiles.map((file) => file.name));
assert.equal(allFiles.length, 17, "17 Reader-PDFs erwartet");
assert.equal(new Set(allFiles).size, 17, "Reader-Dateinamen müssen eindeutig sein");
for (const file of allFiles) {
  assert(manifest.includes(file), "Datei fehlt im Manifest: " + file);
}
const represented = new Set([...analysis.matchAll(/data-source-ids="([^"]+)"/g)].flatMap((m) => m[1].split(",")));
const missing = sources.sources.filter((source) => !represented.has(source.id));
assert.equal(missing.length, 0, "Inhalte ohne Kapitelnachweis: " + missing.map((s) => s.id).join(", "));
for (const key of ["Containment", "Fröhlich-Gildhoff", "Konzeption", "Outlaw", "87 %", "Aktives Zuhören"]) {
  assert(analysis.includes(key), "Prüfungsrelevanter Inhalt fehlt: " + key);
}
assert(!analysis.includes("source-private/"), "Private PDFs dürfen nicht verlinkt werden");

for (const row of report) console.log("OK " + row);
console.log("OK Acht Themenkapitel, 15 Quellengruppen und 17 Reader-Dokumente vollständig zugeordnet.");
