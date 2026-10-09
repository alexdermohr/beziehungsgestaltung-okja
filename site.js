(() => {
  "use strict";

  // Bestehende Lesezeichen aus der früheren Fallwerkstatt erhalten.
  const legacyCaseHashes = new Set(["#lernstrecke", "#ablauf", "#pdf-quellen", "#source-root", "#completion-panel"]);
  const currentHash = window.location.hash;
  const isOverview = window.location.pathname.endsWith("/") || window.location.pathname.endsWith("/index.html");
  if (isOverview && (/^#schritt-[1-8]$/.test(currentHash) || legacyCaseHashes.has(currentHash))) {
    window.location.replace(new URL("fallwerkstatt.html" + currentHash, window.location.href).href);
    return;
  }
  const legacyStudyHashes = {
    "#synthese": "#okja",
    "#gefaehrdung": "#schutz",
    "#verfahren": "#schutz",
    "#spannungen": "index.html#bridge-heading",
    "#klausur": "#pruefung",
    "#quellenapparat": "#quellen"
  };
  if (window.location.pathname.endsWith("/analyse.html") && legacyStudyHashes[currentHash]) {
    window.location.replace(new URL(legacyStudyHashes[currentHash], window.location.href).href);
    return;
  }

  const DATA_URL = "data/sources.json";
  const SOURCE_FALLBACK = "quellen/quellenverzeichnis.md";
  const placeholders = [...document.querySelectorAll("[data-source-ids]")];
  const directories = [...document.querySelectorAll("[data-source-directory]")];

  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };

  const link = (label, href, external = false) => {
    const a = element("a", "", label);
    a.href = href;
    if (external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  };

  function renderChapterSources(data) {
    const byId = new Map(data.sources.map((source) => [source.id, source]));
    for (const container of placeholders) {
      const ids = [...new Set(container.dataset.sourceIds.split(",").map((x) => x.trim()).filter(Boolean))];
      const references = ids.map((id) => byId.get(id)).filter(Boolean);
      const details = element("details", "chapter-references");
      const summary = element("summary", "", "Fachliche Grundlagen nachsehen · " + references.length + (references.length === 1 ? " Quelle" : " Quellen"));
      const list = element("ul", "source-mini-list");
      for (const source of references) {
        const item = element("li");
        if (source.publicPdf) {
          item.append(link(source.title, source.publicPdf.url, true));
        } else {
          item.append(element("span", "", source.title));
        }
        const pageInfo = [...new Set((source.boardFiles || []).map((file) => file.pages).filter(Boolean))].join("; ");
        if (pageInfo) item.append(element("span", "muted", " · " + pageInfo));
        if (source.statusNote) item.append(element("span", "source-note", source.statusNote));
        list.append(item);
      }
      const boardItem = element("li");
      boardItem.append(link("Alle Auszüge im Edupool-Board finden", data.sourceRoot.url, true));
      list.append(boardItem);
      details.append(summary, list);
      container.replaceChildren(details);
    }
  }

  function renderDirectories(data) {
    for (const container of directories) {
      const grid = element("div", "source-directory-grid");
      for (const source of data.sources) {
        const card = element("article", "source-entry");
        card.append(element("h3", "", source.title));
        card.append(element("p", "", source.citation));
        const files = element("ul");
        for (const file of source.boardFiles || []) {
          files.append(element("li", "", file.pages ? file.name + " – " + file.pages : file.name));
        }
        card.append(files);
        const actions = element("div", "source-links");
        if (source.publicPdf) {
          actions.append(link("Öffentliche Gesamt- oder Originalfassung ↗", source.publicPdf.url, true));
        }
        actions.append(link("Edupool-Board ↗", data.sourceRoot.url, true));
        if (source.statusNote) card.append(element("p", "source-note", source.statusNote));
        card.append(actions);
        grid.append(card);
      }
      container.replaceChildren(grid);
    }
  }

  function showSourceError() {
    for (const container of [...placeholders, ...directories]) {
      const message = element("p", "small-note", "Der Quellenkatalog konnte nicht geladen werden. Die Themeninhalte bleiben verfügbar.");
      const fallback = link("Quellenverzeichnis ansehen", SOURCE_FALLBACK);
      container.replaceChildren(message, fallback);
    }
  }

  async function loadSources() {
    if (!placeholders.length && !directories.length) return;
    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error("Quellenkatalog: HTTP " + response.status);
      const data = await response.json();
      if (!Array.isArray(data.sources) || !data.sourceRoot?.url) throw new Error("Ungültiger Quellenkatalog");
      renderChapterSources(data);
      renderDirectories(data);
    } catch (error) {
      showSourceError();
      console.error("Quellenkatalog konnte nicht geladen werden:", error);
    }
  }

  function setupChapterNavigation() {
    const nav = document.querySelector(".chapter-nav");
    if (!nav || !("IntersectionObserver" in window)) return;
    const anchors = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = anchors
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      anchors.forEach((a) => {
        if (a.getAttribute("href") === "#" + visible.target.id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-16% 0px -57% 0px", threshold: [0, 0.1, 0.4] });
    sections.forEach((section) => observer.observe(section));
  }

  setupChapterNavigation();
  loadSources();
})();