#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "analyse.html", "fallwerkstatt.html", "mindmap.html"];
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
  assert(!html.includes("source-private/"), page + ": private Quellen dürfen nicht verlinkt werden");
  const pageIds = ids(html);
  let links = 0;
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = m[1];
    if (/^(?:https?:|mailto:|data:)/.test(href)) continue;
    assert(!/\.pdf(?:[#?]|$)/i.test(href), page + ": keine lokalen Reader-PDFs veröffentlichen: " + href);
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
const mindmap = readFileSync(resolve(root, "mindmap.html"), "utf8");
const chapters = ["okja", "beziehung", "beduerfnisse", "kommunikation", "konzept", "praevention", "schutz", "pruefung"];
for (const id of chapters) {
  assert(analysis.includes('id="' + id + '"'), "Themenkapitel fehlt: " + id);
  assert(index.includes('href="analyse.html#' + id + '"'), "Startseiten-Verweis fehlt: " + id);
  assert(mindmap.includes('href="analyse.html#' + id + '"'), "Mindmap-Verweis fehlt: " + id);
}

// Die Karte muss schon im ausgelieferten HTML vollständig nutzbar sein.
const mapIds = ids(mindmap);
for (const id of ["gesamtbild", "informelle-ansprueche", "kompetenzdimensionen", "prozess", "formale-ansprueche", "recht", "ziele", "wirkungsebenen", "reflexion", "lf5-transfer", "prinzipien", "spannungsfelder", "vernetzte-themen", "quellen"]) {
  assert(mapIds.has(id), "Mindmap-Bereich fehlt: " + id);
}
for (const html of [index, analysis]) {
  const mainNav = html.match(/<nav class="topnav"[\s\S]*?<\/nav>/)?.[0] || "";
  assert(mainNav.includes('href="mindmap.html"'), "Megamindmap muss in der Hauptnavigation erreichbar sein");
}
const heroActions = index.split('<div class="actions">')[1]?.split('</div>')[0] || "";
assert(heroActions.includes('href="mindmap.html"'), "Megamindmap muss direkt im Startseiten-Hero erreichbar sein");
const conceptPath = mindmap.match(/<ol class="concept-path"[\s\S]*?<\/ol>/)?.[0] || "";
assert.deepEqual([...conceptPath.matchAll(/<li id="([^"]+)"/g)].map((m) => m[1]),
  ["leitbild", "konzept", "konzeption", "settings", "praeventionsideen"], "LF6-Prozess muss die fünf Stationen in fachlicher Reihenfolge zeigen");
for (const [id, target] of [["leitbild", "konzept"], ["konzept", "konzept"], ["konzeption", "konzept"], ["settings", "konzept"], ["praeventionsideen", "praevention"]]) {
  assert(conceptPath.includes('<li id="' + id + '"><a class="map-node" href="analyse.html#' + target + '"'), "Prozessknoten braucht passenden Vertiefungslink: " + id);
}
for (const concept of ["Überthema", "Beziehungsgestaltung in der OKJA", "Informelle Ansprüche", "Formale Ansprüche", "begründeter Ansatz", "schriftliche Gesamtausgestaltung", "nicht einheitlich", "Arbeitsunterscheidung", "Rückkopplung", "LF2", "LF5", "Intervention / Kinderschutz", "HANDLUNG ≠ WIRKUNG", "Handlungsziel", "Wirkungsziel", "Wirkungsnachweis", "individuell", "institutionell", "gesellschaftlich", "personal", "sozial", "instrumentell", "kulturell", "politisch"]) {
  assert(mindmap.includes(concept), "Obligatorischer Mindmap-Inhalt fehlt: " + concept);
}
assert(mindmap.includes('class="feedback-link" href="#leitbild"'), "Reflexion muss zum Prozess zurückverweisen");
const principleIds = ["offenheit", "freiwilligkeit", "partizipation", "lebenswelt", "geschlechtergerechtigkeit"];
assert.deepEqual([...mindmap.matchAll(/<li class="principle-branch" id="([^"]+)"/g)].map((m) => m[1]), principleIds,
  "Genau die fünf handlungsleitenden Prinzipien als Hauptäste erwartet");
const principleLabels = ["Offenheit", "Freiwilligkeit", "Partizipation", "Lebenswelt- und Sozialraumorientierung", "Geschlechtergerechtigkeit"];
for (const [i, id] of principleIds.entries()) {
  const core = mindmap.split('<li class="principle-branch" id="' + id + '">')[1]?.split('</a>')[0] || "";
  assert(core.includes('<h3>' + principleLabels[i] + '</h3>') && core.includes('href="analyse.html#okja"') && /<p>[^<]+<\/p>/.test(core),
    "Prinzip benötigt Namen, Erklärung und direkten Wissenslink: " + id);
}
for (const [id, chapter] of [["niedrigschwelligkeit", "konzept"], ["inklusion", "praevention"], ["selbstorganisation", "okja"], ["beziehungsorientierung", "beziehung"], ["beschwerde", "praevention"], ["demokratiebildung", "okja"], ["aneignung", "okja"], ["subjektorientierung", "beduerfnisse"]]) {
  assert(mapIds.has(id), "Praxisorientierung fehlt: " + id);
  const leaf = mindmap.split('<li id="' + id + '">')[1]?.split('</li>')[0] || "";
  assert(leaf.includes('href="analyse.html#' + chapter + '"') && /<h4>[^<]+<\/h4>/.test(leaf) && /<p>[^<]+<\/p>/.test(leaf),
    "Praxisorientierung benötigt Bezeichnung, Alltagsaussage und passenden Link: " + id);
}
for (const concept of ["Praxisorientierungen / Konkretisierungen", "keinen einheitlichen gesetzlichen Prinzipienkatalog", "Querverbindung → Inklusion"]) {
  assert(mindmap.includes(concept), "Einordnung der Praxisorientierungen fehlt: " + concept);
}
const tensions = mindmap.match(/<ul class="tension-grid"[\s\S]*?<\/ul>/)?.[0] || "";
const tensionPairs = [...tensions.matchAll(/<li><a href="analyse.html#([^"]+)"><h3><span>([^<]+)<\/span><span class="tension-symbol"[^>]+>↔<\/span><span>([^<]+)<\/span>/g)].map((m) => [m[1], m[2], m[3]]);
assert.deepEqual(tensionPairs, [["schutz", "Freiwilligkeit", "Schutz"], ["praevention", "Beteiligung", "Grenzen"], ["beziehung", "Nähe", "Distanz"], ["kommunikation", "Vertraulichkeit", "Schutzpflicht"], ["okja", "Offenheit", "Regeln"]],
  "Fünf fachlich zugeordnete Spannungsfelder mit direkten Vertiefungslinks erwartet");
for (const law of ["11", "8", "8a", "8b"]) {
  assert(mindmap.includes('href="https://www.gesetze-im-internet.de/sgb_8/__' + law + '.html"'), "Amtlicher Gesetzeslink fehlt: § " + law);
}
for (const href of ["index.html", "fallwerkstatt.html", "analyse.html#quellen", "quellen/quellenverzeichnis.md", "quellen/pdf-quellen.md"]) {
  assert(mindmap.includes('href="' + href + '"'), "Mindmap-Lernweg oder Quellenzugang fehlt: " + href);
}
report.push("Megamindmap: LF6-Prozess, fünf Prinzipien, acht Praxisorientierungen, fünf Spannungsfelder und acht Themenverbindungen geprüft");
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
for (const concept of ["Vier formale Qualitätsstandards", "Rechtlichen Auftrag konkretisieren", "Bedarfsbezogene Ziele operationalisieren", "überprüfbare Handlungsziele", "Partizipation ermöglichen", "Planen und reflektieren", "Fachliche Ausrichtung:"]) {
  assert(conceptSection.includes(concept), "Konzept-Qualitätskriterium fehlt: " + concept);
}
for (const concept of ["Sucht und Gewalt: das Einrichtungskonzept im Alltag anwenden", "Substanzkonsum ist nicht automatisch Abhängigkeit", "Beziehung & Beteiligung", "Schutz & Regeln", "Team & Netzwerk"]) {
  assert(conceptSection.includes(concept), "PT2-Praxisfeld Sucht/Gewalt fehlt: " + concept);
}
assert(/data-source-ids="[^"]*pt2-basiskompetenzen/.test(conceptSection),
  "PT2-Transfer Sucht/Gewalt benötigt einen eigenen Prüfungsquellenbezug");
const examSection = analysis.split('id="pruefung"')[1]?.split('id="quellen"')[0] || "";
for (const concept of [
  "Sechs Denkschritte für eine schriftliche Fallantwort",
  "Sozialpädagogischer Handlungszyklus Hamburg: fünf Phasen",
  "als didaktisches Prinzip",
  "phasenspezifische Merkmale",
  "variabel bearbeitet",
  "Verstehen/Analysieren",
  "Entscheiden/Planen",
  "im weiteren Zyklus fachlich aufzuarbeiten",
  "Phasenreihenfolge maßgeblich",
  "Wahrnehmen / Erleben",
  "Verstehen und Analysieren",
  "Entscheiden und Planen",
  "Umsetzen / Interagieren",
  "Reflektieren und Evaluieren",
  "Schreibgliederung für die Klausur",
  "HIBB-Handreichung, Abschnitt 2.4"
]) {
  assert(examSection.includes(concept), "Hamburger Handlungszyklus oder Abgrenzung fehlt: " + concept);
}
assert(!examSection.includes("konkretisiert die vollständige pädagogische Handlung"),
  "HIBB-Zyklus darf nicht unbelegt mit der vollständigen Handlung gleichgesetzt werden");
const fivePhaseMarkup = examSection.split('aria-label="Fünf Phasen des Sozialpädagogischen Handlungszyklus Hamburg">')[1]?.split('<p class="small-note">')[0] || "";
assert.equal((fivePhaseMarkup.match(new RegExp("<span>0[1-5]</span>", "g")) || []).length, 5,
  "Der Hamburger Handlungszyklus muss exakt fünf Kernphasen ausweisen");
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
