# 🐍 Snake 5.0 – Neon Arcade Edition

A premium browser-based Snake game with neon aesthetics, incremental upgrades, and an AI autoplay mode.

## Features

- 🎮 **Three Snake Types** – Velo-Scythe (speed), Neon Viper (balanced), Gold Monarch (double points)
- 🤖 **AI Autoplay** – Intelligent flood-fill pathfinding that avoids walls and its own body
- ⚡ **Power-ups** – Speed boost, Ghost mode (wall phasing), Shield
- 🌟 **Combo Multiplier** – Chain food pickups to ramp up your score
- 🏆 **Skill Tree** – Spend earned BITS on persistent upgrades between rounds
- 💾 **Persistent Save** – Progress saved locally via `localStorage`
- 🎵 **Sound Effects** – Web Audio API driven sound system

## How to Play

1. Open `index.html` in any modern browser – no server required.
2. Select a snake type and hit **SPIEL STARTEN**.
3. Use **Arrow Keys** or **WASD** to steer.
4. Eat food before the round timer runs out to keep your combo alive.
5. Collect power-ups for temporary advantages.
6. Earn BITS and spend them in the **Skill Tree** for permanent upgrades.

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move |
| Escape | Pause / Resume |
| On-screen buttons | Touch / click controls |

## AI Autoplay

Purchase the **AI Player** upgrade in the Skill Tree (500 BITS). The AI uses a **flood-fill scoring algorithm**: it evaluates every possible move, counts reachable open cells from that position, and prefers moves with the most open space — breaking ties by proximity to food. This ensures the snake avoids dead ends and never runs into its own body.

## Tech Stack

- Vanilla HTML5, CSS3, JavaScript (ES6+)
- Canvas 2D API for rendering
- Web Audio API for sound
- No dependencies – runs entirely in the browser

## License

MIT
