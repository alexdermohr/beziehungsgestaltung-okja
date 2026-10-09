#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

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
const conceptSection = analysis.split('id="konzept"')[1]?.split('id="praevention"')[0] || "";
for (const concept of ["Vier formale Qualitätsstandards", "Rechtlichen Auftrag konkretisieren", "Bedarfe ermitteln, Ziele überprüfen", "Partizipation ermöglichen", "Planen und reflektieren", "Fachliche Ausrichtung:"]) {
  assert(conceptSection.includes(concept), "Konzept-Qualitätskriterium fehlt: " + concept);
}
const preventionSection = analysis.split('id="praevention"')[1]?.split('id="schutz"')[0] || "";
for (const example of ["Alltagsintegrierte Prävention", "Offener Treff", "Mitgestaltung", "Beratung & Übergänge"]) {
  assert(preventionSection.includes(example), "Praxisnahe Prävention fehlt: " + example);
}
assert(!analysis.includes("source-private/"), "Private PDFs dürfen nicht verlinkt werden");

for (const row of report) console.log("OK " + row);
console.log("OK Acht Themenkapitel, 15 Quellengruppen und 17 Reader-Dokumente vollständig zugeordnet.");

// Site-Skript ohne Fremdpakete mit kleinen DOM-Mocks ausführen.
// Damit werden alte Lesezeichen und bibliografische Warnhinweise tatsächlich geprüft.
const siteScript = readFileSync(resolve(root, "site.js"), "utf8");
const baseUrl = "https://example.invalid/beziehungsgestaltung-okja/";

function simulatePage(url, { sourceDirectory = false } = {}) {
  const location = new URL(url, baseUrl);
  let redirect = null;
  location.replace = (url) => { redirect = String(url); };
  class MockNode {
    constructor(tag) {
      this.tag = tag;
      this.className = "";
      this.textContent = "";
      this.children = [];
    }
    append(...items) {
      for (const item of items) {
        if (item && typeof item === "object") item.parentNode = this;
        this.children.push(item);
      }
    }
    replaceChildren(...items) {
      this.children = [];
      this.append(...items);
    }
    closest(tag) {
      for (let node = this; node; node = node.parentNode) {
        if (node.tag === tag) return node;
      }
      return null;
    }
    scrollIntoView() { this.scrolled = true; }
  }
  const directory = new MockNode("div");
  const disclosure = new MockNode("details");
  disclosure.append(directory);
  const findById = (node, id) => node.id === id ? node :
    (node.children || []).map((child) => findById(child, id)).find(Boolean) || null;
  const doc = {
    querySelectorAll(selector) {
      return selector === "[data-source-directory]" && sourceDirectory ? [directory] : [];
    },
    querySelector() { return null; },
    getElementById(id) { return findById(disclosure, id); },
    createElement(tag) { return new MockNode(tag); }
  };
  runInNewContext(siteScript, {
    URL,
    window: { location },
    document: doc,
    console,
    fetch: async () => ({ ok: true, json: async () => sources })
  });
  return { redirect: () => redirect, directory, disclosure };
}

for (const [legacy, expected] of [
  ["index.html#schritt-4", "fallwerkstatt.html#schritt-4"],
  ["#schritt-1", "fallwerkstatt.html#schritt-1"],
  ["index.html#pdf-quellen", "fallwerkstatt.html#pdf-quellen"],
  ["analyse.html#textstudium", "analyse.html#inhalt"],
  ["analyse.html#gefaehrdung", "analyse.html#schutz"],
  ["analyse.html#quellenapparat", "analyse.html#quellen"],
  ["analyse.html#spannungen", "index.html#bridge-heading"]
]) {
  const target = simulatePage(legacy).redirect();
  assert.equal(target, new URL(expected, baseUrl).href, "Alter Link muss weiterleiten: " + legacy);
}
assert.equal(simulatePage("index.html#themen").redirect(), null, "Aktuellen Anker nicht umleiten");
const fallwerkstattScript = readFileSync(resolve(root, "app.js"), "utf8");
assert(fallwerkstattScript.includes("options.updateHash !== false"),
  "Fallwerkstatt muss die Erhaltung direkter Quellenanker erlauben");
assert(fallwerkstattScript.includes("updateHash: !keepInitialHash"),
  "Fallwerkstatt darf alte Quellen-/Ablaufanker beim Einstieg nicht überschreiben");

const { directory } = simulatePage("analyse.html", { sourceDirectory: true });
// Nach zwei await-Schritten muss der asynchrone Katalog geladen und gerendert sein.
await new Promise((resolve) => setImmediate(resolve));
const cards = directory.children[0]?.children || [];
assert.equal(cards.length, 15, "Genau 15 Quellengruppen gerendert");
for (const sourceId of ["kinderschutz-krisenintervention", "lvr-wissen-was-wirkt"]) {
  const source = sources.sources.find((s) => s.id === sourceId);
  assert(source?.statusNote, "Testquelle muss spezifische Provenienznotiz besitzen: " + sourceId);
  const card = cards.find((node) => node.children.some((c) => c.tag === "h3" && c.textContent === source.title));
  assert(card, "Fehlende Quellenkarte: " + sourceId);
  assert(card.children.some((c) => c.className === "source-note" && c.textContent === source.statusNote),
    "Hinweis wurde bei " + sourceId + " nicht wiedergegeben");
}
const linkedSource = simulatePage("analyse.html#quelle-aktives-zuhoeren", { sourceDirectory: true });
await new Promise((resolve) => setImmediate(resolve));
const requestedSource = linkedSource.directory.children[0].children.find((card) => card.id === "quelle-aktives-zuhoeren");
assert(requestedSource, "Alter Quellen-Direktlink muss wieder eine konkrete Quellenkarte treffen");
assert.equal(linkedSource.disclosure.open, true, "Bibliografie muss für alten Direktlink aufgeklappt werden");
assert.equal(requestedSource.scrolled, true, "Alte Quellenkarte muss nach Laden sichtbar angesteuert werden");
console.log("OK Alte URL-Anker, vollständige Quellenrendering-Ausgabe und spezifische Provenienz-Hinweise.");