# Beziehungsgestaltung in der OKJA

Strukturierte Lern- und Quellenbasis für die **Prüfung 2027 Sommer FS** mit dem Überthema **Beziehungsgestaltung in der Offenen Kinder- und Jugendarbeit (OKJA)**.

Kindeswohlgefährdung, Schutzauftrag und Krisenintervention bleiben als wichtiger fachlicher **Anwendungs- und Belastungskontext** enthalten. Sie bestimmen aber nicht die Projektidentität: Der rote Faden ist, wie professionelle Beziehungen in der OKJA aufgebaut, gestaltet, reflektiert und auch unter Konflikt-, Krisen- und Schutzbedingungen tragfähig gehalten werden.

## Lernwerkstatt-Webseite

Die Repository-Wurzel enthält eine statische Prüfungsübungs-Webseite für die exemplarische Fallbearbeitung:

- Einstieg über einen ausdrücklich fiktiven Fall aus der Offenen Kinder- und Jugendarbeit;
- acht aufeinander aufbauende Arbeitsschritte vom Lagebild bis zum Prüfungstransfer als mögliches Klausurvorgehen;
- Beziehungsaufbau, Kommunikation, psychische Grundbedürfnisse, Konfliktbearbeitung und professionelle Rollen als Leitperspektive;
- Kinderschutz und § 8a SGB VIII als besonderer Anwendungskontext professioneller Beziehungsgestaltung;
- Konzeptentwicklung, Beteiligung und Prävention als strukturelle Ebene der OKJA;
- fachliche Kontrollpunkte und Quellenbezüge;
- fokussierte PT2-Quellenbibliothek mit 15 fachlichen Quellen bzw. 17 geführten Board-PDFs;
- separate Seite `analyse.html` für vertiefte Textarbeit mit Beziehungsmodellen, Grundbedürfnissen, Gesprächsführung, Spannungsfeldern, Kinderschutz-Kontext, Konzeptbausteinen und fallbezogenem Klausurtransfer;
- lokale Notizen und Fortschrittsanzeige ohne Konto oder Server-Datenspeicherung;
- Druckansicht für Arbeitsblätter bzw. PDF-Ausgabe.

Die Seite bleibt ohne Frontend-Build nutzbar. `index.html`, `styles.css` und `app.js` bilden die Oberfläche; `data/sources.json` ist der einzige gepflegte Quellenkatalog, aus dem Schrittquellen und Gesamtbibliothek im Browser gerendert werden.

## Stand

Erfasst am 21.09.2026 aus dem bereitgestellten Edupool-Board; am 28.09.2026 erneut vollständig gegen das Live-Board verifiziert und frisch heruntergeladen.

**Oberquelle:** Edupool-Board „Prüfung 2027 Sommer FS“. URL und Provenienz werden ausschließlich im kanonischen Quellenkatalog `data/sources.json` gepflegt und daraus in Webseite und generierte Quellenverzeichnisse übernommen.

- 25 für den PT2-Schwerpunkt relevante Board-Karten fachlich berücksichtigt;
- 17 für dieses Projekt relevante PDF-Dateien im technischen Manifest geführt (32.313.112 Byte); die Dateigrößen und SHA-256-Prüfsummen sind verifiziert;
- alle PDFs lokal in Text überführt;
- textbasierte PDFs mit `pdftotext`, Scan-PDFs ergänzend mit deutscher/englischer OCR;
- Quelldateien und Volltranskripte liegen ausschließlich im lokalen, von Git ausgeschlossenen Verzeichnis `source-private/`.

## Öffentliche Grenze

Das Board enthält Auszüge verschiedener Urheber und Herausgeber. Der vom Nutzer zur Veröffentlichung bestimmte Board-Link wird als Oberquelle öffentlich genannt. Das begründet keine Erlaubnis zur Weiterveröffentlichung der dort enthaltenen oder verlinkten Fremdmaterialien. Öffentlich versioniert werden daher ansonsten nur eigene Strukturierungen, bibliografische Angaben, Seitenbereiche, technische Prüfsummen, die Prüfungsübungs-Webseite und die Erfassungsskripte. PDFs und Volltranskripte bleiben lokal.

Siehe [RECHTE.md](RECHTE.md).

## Quellenwahrheit

`data/sources.json` ist die kanonische Quelle für:

- alle im fokussierten technischen Manifest erfassten Board-PDF-Dateien;
- bibliografische Angaben und prüfungsrelevante Seitenbereiche;
- den Status öffentlicher PDF-Fassungen;
- die unterschiedlichen öffentlichen Direkt-PDF-URLs;
- die Zuordnung der Quellen zu den acht Lernschritten;
- die Oberquelle des Boards.

`quellen/pdf-quellen.md` und `quellen/quellenverzeichnis.md` werden daraus erzeugt und tragen deshalb einen GENERATED-Hinweis. Nach Änderungen am Katalog:

```bash
node scripts/render-source-docs.mjs
```

Der Generator prüft dabei auch die vollständige Übereinstimmung mit `quellen/manifest.csv`, eindeutige Quellen-IDs, eindeutige öffentliche PDF-URLs und die acht Schrittzuordnungen.

## Inhalt

- [Lernwerkstatt Beziehungsgestaltung](index.html)
- [Vertieftes Textstudium](analyse.html)
- [Prüfungsstruktur und Board-Inventar](docs/pruefungsstruktur.md)
- [Themen- und Quellenmatrix](docs/themenmatrix.md)
- [Quellenverzeichnis](quellen/quellenverzeichnis.md) — generiert aus dem Quellenkatalog
- [Öffentliche PDF-Links und Status](quellen/pdf-quellen.md) — generiert aus dem Quellenkatalog
- [Transkriptionsstatus](docs/transkriptionsstatus.md)
- `data/sources.json`: kanonischer Quellenkatalog
- `quellen/manifest.csv`: technische Provenienz der 17 für dieses Projekt geführten PDFs
- `scripts/`: Erfassung, Download, Textgewinnung, OCR und Quellen-Dokumentgenerierung

## Projektkern: Beziehungsgestaltung in der OKJA

Das Repository ordnet die PT2-Inhalte unter einer leitenden Frage:

> Wie kann professionelle Beziehungsgestaltung in der OKJA auch unter Konflikt-, Krisen- und Schutzbedingungen tragfähig, beteiligungsorientiert und fachlich reflektiert bleiben?

Daraus ergeben sich vier miteinander verbundene Linien:

1. **Beziehungsgestaltung als Leitthema:** tragfähige professionelle Beziehungen aufbauen, aufrechterhalten und in Konflikten bewusst gestalten.
2. **Grundbedürfnisse, Haltung und Kommunikation:** jugendliches Verhalten verstehen, dialogisch arbeiten, aktiv zuhören und Macht sowie Nähe und Distanz reflektieren.
3. **OKJA, Konzeptentwicklung und Prävention:** Beziehungsgestaltung in Prinzipien, Alltagsgestaltung, Beteiligung, Angeboten und Organisationsstrukturen verankern.
4. **Kinderschutz und Krisenintervention als Anwendungskontext:** Gefährdungshinweise, Schutzauftrag, Beteiligung und Verfahren so bearbeiten, dass notwendiges Schutzhandeln und Beziehungsgestaltung nicht künstlich gegeneinander ausgespielt werden.

Die offizielle PT2-Komplexhandlung des Prüfungsboards verknüpft Beziehungsgestaltung und konzeptionelle Gestaltung ausdrücklich mit dem Verdacht auf Kindeswohlgefährdung. Diese Prüfungsverknüpfung bleibt vollständig erhalten; die Lernarchitektur dieses Repositorys setzt jedoch **Beziehungsgestaltung in der OKJA** als übergeordneten fachlichen Rahmen.

## Lokale Nutzung der Webseite

Im Repository-Verzeichnis genügt zum Beispiel:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Danach `http://127.0.0.1:8000/` im Browser öffnen. Für die Nutzung auf mehreren Geräten ist die veröffentlichte GitHub-Pages-Fassung vorgesehen.

## Lokale Reproduktion der Quellen

Voraussetzungen: Node.js, Poppler (`pdftotext`, `pdftoppm`) und für Scan-PDFs Tesseract mit `deu` und `eng`. Die Skripte schreiben Rohdaten ausschließlich nach `source-private/`; dieses Verzeichnis ist per `.gitignore` ausgeschlossen.
