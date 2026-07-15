# Snake 5.0 - Vibe Code Edition

A browser-based Snake game featuring neon styling, a persistent upgrade system, and an optional AI autoplay mode.

## Features

- **Gameplay**: Classic Snake mechanics combined with a round timer limit.
- **AI Autopilot**: Smart pathfinding using a flood-fill algorithm to avoid dead-ends, obstacles, and the snake's own body.
- **Power-ups**: Temporary active effects including Speed Boost, Ghost Mode (phasing through obstacles), and Shield protection.
- **Upgrade System**: Earned Bits can be spent in the Upgrade Modulator between rounds to unlock permanent enhancements (extend round time, accelerate food spawn rates, increase speed, buy AI player modules).
- **Multilanguage**: Quick translation toggle (DE/EN) located directly in the main menu.
- **Persistence**: Game progress and upgrades are saved locally using the browser's `localStorage` API.
- **Audio**: Retro-styled sound effects powered by the Web Audio API.

## Installation & Running

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser. No local web server setup is required.

## Controls

| Key | Action |
|---|---|
| Arrow Keys / WASD | Steer direction |
| Escape | Pause / Resume |
| On-screen buttons | Touch control layout for mobile / simulation |

## AI Autopilot Details

The autopilot utilizes a Breadth-First Search (BFS) based flood-fill algorithm:
1. Simulates candidate directions for the next move.
2. Calculates the count of reachable open grid cells for each choice to prevent entrapment.
3. Prioritizes routes maximizing open spaces, breaking ties by choosing the path closest to the nearest food target.

## Technical Stack

- HTML5, CSS3, and JavaScript (ES6+, Vanilla, zero external dependencies)
- Canvas 2D API for rendering
- Web Audio API for custom generated sound effects
