import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const port = process.argv[2];
const outJson = process.argv[3];
const outText = process.argv[4];
const catalogPath = process.argv[5] || "data/sources.json";
if (!port || !outJson || !outText) {
  throw new Error("usage: node scripts/capture-board.mjs <cdp-port> <out.json> <out.txt> [catalog.json]");
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const allowedNames = new Set(
  (catalog.sources || [])
    .flatMap(source => source.boardFiles || [])
    .map(file => String(file.name || "").normalize("NFC"))
    .filter(Boolean)
);
if (!allowedNames.size) throw new Error("catalog contains no board files");

const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
const page = pages.find(p => p.type === "page" && p.url.includes("boards.edupool.cloud"));
if (!page) throw new Error("Edupool board target not found");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error("ws open timeout")), 5000);
  ws.addEventListener("open", () => { clearTimeout(t); resolve(); }, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let id = 0;
function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const req = ++id;
    const t = setTimeout(() => reject(new Error(method + " timeout")), 10000);
    const handler = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== req) return;
      ws.removeEventListener("message", handler);
      clearTimeout(t);
      if (msg.error) reject(new Error(JSON.stringify(msg.error))); else resolve(msg.result);
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id: req, method, params }));
  });
}

function fileNameFromHref(href) {
  try {
    return decodeURIComponent(basename(new URL(href).pathname)).normalize("NFC");
  } catch {
    return "";
  }
}

const expression = `JSON.stringify({
  captured_at: new Date().toISOString(),
  url: location.href,
  title: document.title,
  links: Array.from(document.querySelectorAll("a"))
    .map((a, i) => ({ i, text: (a.innerText || a.textContent || "").trim(), href: a.href || "" }))
    .filter(x => x.href)
})`;
const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
const observed = JSON.parse(result.result.value || "{}");
const relevantLinks = (observed.links || []).filter(link => {
  const name = fileNameFromHref(link.href);
  return allowedNames.has(name);
});
const uniqueLinks = [...new Map(relevantLinks.map(link => [link.href, link])).values()];
const observedNames = new Set(uniqueLinks.map(link => fileNameFromHref(link.href)));
const missing = [...allowedNames].filter(name => !observedNames.has(name));
if (missing.length) {
  throw new Error(`board capture misses catalog files: ${JSON.stringify(missing)}`);
}

const data = {
  captured_at: observed.captured_at,
  url: observed.url,
  title: observed.title,
  selection: {
    catalog: catalogPath,
    focus: "Beziehungsgestaltung in der OKJA",
    allowed_board_files: allowedNames.size
  },
  links: uniqueLinks
};
writeFileSync(outJson, JSON.stringify(data, null, 2) + "\n");
writeFileSync(
  outText,
  [
    data.title || "Edupool-Board",
    "Fokus: Beziehungsgestaltung in der OKJA",
    `Erfasste relevante Board-Dateien: ${uniqueLinks.length}`,
    "",
    ...uniqueLinks.map(link => `${fileNameFromHref(link.href)}\t${link.href}`)
  ].join("\n") + "\n"
);
console.log(JSON.stringify({
  title: data.title,
  allowed_board_files: allowedNames.size,
  captured_links: uniqueLinks.length
}));
ws.close();
