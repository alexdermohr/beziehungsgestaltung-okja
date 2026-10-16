# Megamindmap – Prüfprotokoll

Stand: 16.10.2026. Ausgangspunkt: `f7d6737`.

## Umsetzung und fachlicher Abgleich

- Neue statische `mindmap.html` und ergänzende `mindmap.css`; alle Inhalte und Links ohne JavaScript verfügbar.
- Einstieg im Hero und in der Hauptnavigation von `index.html`, außerdem in der Navigation von `analyse.html` und `fallwerkstatt.html`.
- Beziehungsgestaltung als Überthema; drei Anspruchsbereiche mit LF6-Prozess, Reflexionsschleife und untergeordnetem LF5-Transfer.
- Genau fünf Prinzipien als Hauptäste; acht zusätzliche Praxisorientierungen mit eigenen Knoten und eine weitere Konkretisierung zur Geschlechtergerechtigkeit. Beschwerdemöglichkeiten sind mit Partizipation verbunden.
- Alle acht Fachkapitel, Fallwerkstatt, Startseite, interne Quellenverzeichnisse und vier amtliche SGB-VIII-Einzelnormen direkt verlinkt.
- Abgeglichen mit `analyse.html` (alle acht Fachkapitel), `docs/pruefungsstruktur.md`, `docs/themenmatrix.md`, `data/sources.json` und `quellen/pdf-quellen.md`. § 11 SGB VIII zusätzlich im amtlichen Online-Text geprüft.
- Kompetenzdimensionen und Wirkungsebenen sind als Lernschema bzw. angestrebte Veränderungen eingeordnet. Konzept/Konzeption sind ausdrücklich eine uneinheitlich verwendete Arbeitsunterscheidung. Es werden keine Wirkungen als erwiesen dargestellt.

## Ausgeführte Prüfungen

Die Node-Aufrufe verwenden den vorhandenen Node-22-Binary unter `/usr/bin`, da der lokale Shell-Wrapper außerhalb des Worktrees schreiben möchte. Reproduzierbar mit `PATH=/usr/bin:/bin` vor den Befehlen.

| Prüfung | Ergebnis |
| --- | --- |
| `node scripts/check-site.mjs` | Grün: vier HTML-Seiten; 153 interne Links/Assets; eindeutige IDs und existente Anker; bisherige Quellen- und Lesezeichenprüfungen erhalten. |
| Neue Kartenprüfungen im selben Skript | Grün: fünf Prozessstationen in Reihenfolge mit passenden Links, fünf Prinzipien, acht Praxisorientierungen, fünf zugeordnete Spannungspaare, Rückkopplung, acht Themen und Quellenzugänge. |
| `node --check site.js` | Grün. |
| `node --check app.js` | Grün. |
| `node --check scripts/check-site.mjs` | Grün. Kein zusätzliches Laufzeit-JavaScript; bestehender Workflow führt die erweiterten Prüfungen aus. |
| HTML5-Parsing mit vorhandenem Python-`html5lib` | Alle vier HTML-Seiten ohne Parserfehler; keine verschachtelten Links. |
| Farbkontraste, rechnerisch nach relativer sRGB-Luminanz | Geprüfte Textfarben mindestens 5,72:1; wesentliche Verbindungslinien mindestens 3,41:1 auf ihrem hellen Hintergrund. |
| `node scripts/render-source-docs.mjs` und Quellen-Diff | Grün: generierte Verzeichnisse unverändert. |
| `git diff --check` | Grün. |

## Grenzen der lokalen Prüfung

Chrome/Playwright konnte in dieser Sandbox nicht starten: `setsockopt` bzw. `shutdown` wird durch die Ausführungsumgebung untersagt. Daher sind keine Screenshots, gerenderten Overflow-Messungen oder echten Tastaturtests belegt.

Die CSS-Struktur wurde statisch geprüft: drei Spalten ab 1100 px; fünf Prinzipienäste nebeneinander ab 1180 px; darunter vertikale Bäume, bis 700 px einzelne Äste und Praxisbeispiele untereinander. Flexible Spalten mit `minmax(0, 1fr)`, umbrechende Links und lokale Konnektoren vermeiden feste Diagrammbreiten. Eine visuelle Kontrolle bei 1440, 1024, 768, 390 und 320 px bleibt als Review-Schritt offen. Alle Aktionen sind native Links mit sichtbarem Fokus; die Mindmap lädt kein Skript und benötigt keinen JavaScript-Fallback.

## Arbeitsstand

Geändert: `index.html`, `analyse.html`, `fallwerkstatt.html`, `scripts/check-site.mjs`. Neu: `mindmap.html`, `mindmap.css`, dieses Prüfprotokoll. Git-Status und Diff-Statistik nach der Umsetzung kontrolliert; keine Änderungen außerhalb des Repositorys übernommen. Keine PDFs, Quellvolltexte oder Tafelaufnahme hinzugefügt. Kein Commit, Push, PR oder Merge ausgeführt.
