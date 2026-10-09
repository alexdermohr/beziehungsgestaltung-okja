# Beziehungsgestaltung in der OKJA

Thematisch gegliederte Lern- und Prüfungswebseite zur **Lernfeldprüfung PT2, Sommer 2027**. Leitmotiv ist die professionelle **Beziehungsgestaltung in der Offenen Kinder- und Jugendarbeit**. Kinderschutz ist ein wichtiger Anwendungskontext, nicht das übergeordnete Projektthema.

## Webseite

| Seite | Inhalt |
| --- | --- |
| [Themenübersicht](index.html) | Acht Themen mit Kernaussagen und Verknüpfungen; Einstiegspunkt der Webseite. |
| [Themenwissen](analyse.html) | Zusammengeführte Fachinhalte, Begriffsklärungen, Praxisbeispiele, Spannungsfelder und Prüfungsbezug. |
| [Fallwerkstatt](fallwerkstatt.html) | Acht Arbeitsschritte am ausdrücklich fiktiven Fall, freiwillige Lernnotizen im Browser. |

Die acht Themen sind: Grundlagen der OKJA; professionelle Beziehungsarbeit; psychische Grundbedürfnisse und Entwicklung; Haltung und Kommunikation; Konzeptentwicklung; Beteiligung und Prävention; Schutzverantwortung als Anwendungskontext; Prüfungstransfer.

Im Vordergrund stehen **Inhalte und Zusammenhänge**, nicht die Dokumentenreihenfolge. Urheber und Fundstellen bleiben für Nachprüfbarkeit vorhanden. Die Themenübersicht und das Themenwissen benutzen site.css und site.js. Die erhaltene Fallwerkstatt verwendet weiterhin styles.css und app.js. Es gibt keinen Frontend-Build und keine serverseitige Speicherung von Benutzerdaten.

## Fachliche Quellen

Das [Edupool-Board „Prüfung 2027 Sommer FS“](https://boards.edupool.cloud/s/Id-aVXBZEkn6RYOYY1aaEximB7QgB7SL0YOhxrezpdM) ist die Oberquelle. Die für dieses Projekt erschlossenen **17 PDF-Dateien** umfassen **98 PDF-Seiten** und gehören zu **15 Quellengruppen**. Die vollständige Dateiübersicht steht im [Manifest](quellen/manifest.csv); alle 17 PDFs wurden lokal in Text/OCR überführt.

Der gepflegte Quellenkatalog ist data/sources.json. [PDF-Quellen und Status](quellen/pdf-quellen.md), [Quellenverzeichnis](quellen/quellenverzeichnis.md), [Prüfungsstruktur](docs/pruefungsstruktur.md) und [Quellenrechte](RECHTE.md) ergänzen ihn.

Die PDFs und Volltranskripte liegen ausschließlich lokal unter source-private/ und werden nicht öffentlich gespiegelt. Ein öffentlicher Link ist keine Erlaubnis zur Weiterveröffentlichung.

## Lokal ansehen und prüfen

Aus dem Repository-Verzeichnis:

~~~sh
python3 -m http.server 8000 --bind 127.0.0.1
~~~

Danach http://127.0.0.1:8000/ öffnen. Ohne Buildprozess nutzbar.

~~~sh
node scripts/check-site.mjs
node --check site.js
node --check app.js
~~~

Bei Änderungen an data/sources.json die generierten Quellenverzeichnisse mit node scripts/render-source-docs.mjs aktualisieren.

**Hinweis:** Dieses Lernprodukt ersetzt keine Verfahrensanweisung im realen Kinderschutz. Hier gelten die jeweils aktuellen Rechtsgrundlagen und die Trägerverfahren.
