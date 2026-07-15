# Snake 5.0 - Neon Arcade Edition

Ein browserbasiertes Snake-Spiel mit Neon-Optik, persistentem Upgrade-System und optionalem KI-Autopiloten.

## Features

- **Spielmechanik**: Klassisches Snake-Gameplay mit einem Runden-Zeitlimit.
- **KI-Autopilot**: Sucht Pfade über einen Flood-Fill-Algorithmus zur Vermeidung von Hindernissen und des eigenen Körpers.
- **Power-ups**: Temporäre Effekte wie Geschwindigkeits-Boost, Phasenverschiebung (Geist-Modus) und Schutzschild.
- **Upgrade-System**: Erspielte Bits können zwischen den Runden im Upgrade-Modulator für dauerhafte Verbesserungen (Rundenzeit, Nahrungspawns, Geschwindigkeit, KI) ausgegeben werden.
- **Mehrsprachigkeit**: Integrierter Sprachwechsel (DE/EN) im Hauptmenü.
- **Speicherung**: Lokale Speicherung des Spielfortschritts über die `localStorage`-API des Browsers.
- **Audio**: Soundeffekte erzeugt über die Web Audio API.

## Installation und Ausführung

1. Das Repository lokal klonen oder herunterladen.
2. Die Datei `index.html` direkt in einem modernen Webbrowser öffnen. Ein lokaler Server ist nicht zwingend erforderlich.

## Steuerung

| Taste | Aktion |
|---|---|
| Pfeiltasten / WASD | Steuerung der Richtung |
| Escape | Pause / Fortsetzen |
| Bildschirmtasten | Touch-Steuerung für Mobilgeräte |

## KI-Autopilot Details

Der Autopilot nutzt eine Breitensuche (BFS) für Flood-Fill:
1. Simuliert die möglichen nächsten Schritte.
2. Berechnet die Anzahl erreichbarer Zellen für jeden Schritt, um Sackgassen zu vermeiden.
3. Bevorzugt Wege mit maximalem Freiraum und minimiert bei Gleichstand die Distanz zur nächsten Nahrung.

## Technische Basis

- HTML5, CSS3 und JavaScript (ES6+, Vanilla, keine externen Bibliotheken)
- Canvas 2D API für das Rendering
- Web Audio API für Soundeffekte
