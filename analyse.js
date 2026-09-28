(() => {
  const SOURCE_DATA_URL = "data/sources.json";
  const sourceList = document.querySelector("#study-source-list");
  const usedIds = [...new Set([...document.querySelectorAll("[data-source-id]")].map((el) => el.dataset.sourceId))];

  function el(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function renderSources(data) {
    const byId = new Map(data.sources.map((source) => [source.id, source]));
    sourceList.replaceChildren();

    for (const id of usedIds) {
      const source = byId.get(id);
      if (!source) continue;

      const card = el("article", "study-source-card");
      card.id = `quelle-${source.id}`;
      card.append(el("span", source.publicPdf ? "pdf-status" : "pdf-status unavailable", source.publicPdf ? source.publicPdf.label : "Boardquelle"));
      card.append(el("h3", "", source.title));
      card.append(el("p", "", source.citation));

      const files = el("ul", "study-source-files");
      for (const file of source.boardFiles || []) {
        const suffix = file.pages ? ` — ${file.pages}` : "";
        files.append(el("li", "", `${file.name}${suffix}`));
      }
      card.append(files);

      if (source.statusNote) card.append(el("p", "pdf-note", source.statusNote));

      const actions = el("div", "study-source-actions");
      if (source.publicPdf) {
        const link = el("a", "button secondary", "Öffentliche Fassung öffnen ↗");
        link.href = source.publicPdf.url;
        link.target = "_blank";
        link.rel = "noreferrer";
        actions.append(link);
      }
      const board = el("a", "button ghost", "Edupool-Board ↗");
      board.href = data.sourceRoot.url;
      board.target = "_blank";
      board.rel = "noreferrer";
      actions.append(board);
      card.append(actions);
      sourceList.append(card);
    }
  }

  async function loadSources() {
    try {
      const response = await fetch(SOURCE_DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      renderSources(data);
    } catch (error) {
      sourceList.replaceChildren();
      const p = el("p", "source-load-error", "Der Quellenapparat konnte nicht geladen werden.");
      const a = el("a", "button secondary", "Quellenverzeichnis öffnen");
      a.href = "quellen/quellenverzeichnis.md";
      sourceList.append(p, a);
      console.error("Quellenapparat konnte nicht geladen werden:", error);
    }
  }

  const tocLinks = [...document.querySelectorAll(".study-toc a")];
  const sections = tocLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      tocLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-18% 0px -65% 0px", threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  loadSources();
})();
