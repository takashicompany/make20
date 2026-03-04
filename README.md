# Make20

A 2048-style puzzle game for [Even Realities G2](https://www.evenrealities.com/) smart glasses.

Merge identical numbers on a 4x4 board to create larger numbers. The goal is to reach ⑳ (20).

## Play Now

Scan the QR code with your Even G2 glasses to play:

<p align="center">
  <img src="qr.png" alt="QR Code" width="200">
</p>

https://takashicompany.github.io/make20/

## Screenshots

<p align="center">
  <img src="images/ss/01.png" alt="Gameplay" width="400">
</p>

## How It Works

Unlike the original 2048 (which doubles: 2→4→8→...), Make20 uses sequential numbers (①→②→③→...). When two identical tiles merge, they become the next number (e.g. ③+③=④).

The board is rendered entirely with Unicode characters (circled numbers ①-⑳) to work within the G2's text container system.

```
┌─┬─┬─┬─┐
│①│②│  │④│
├─┼─┼─┼─┤
│  │③│①│  │
├─┼─┼─┼─┤
│②│  │⑤│①│
├─┼─┼─┼─┤
│  │④│  │②│
└─┴─┴─┴─┘
```

## Controls

| Input | Action |
|-------|--------|
| Scroll up / down | Move tiles |
| Tap | Switch direction (↕ vertical ↔ horizontal) |

The current direction is shown in the header. Scroll moves tiles along the active axis.

## Features

- Smooth tile sliding animation with pixel-level movement
- Score tracking with high score persistence
- Auto-save and resume on reconnect
- Game over detection

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- Even Realities G2 glasses (or the [evenhub-simulator](https://www.npmjs.com/package/@evenrealities/evenhub-simulator))

### Development

```bash
npm install
npm run dev
```

### Connect to Glasses

```bash
npm run qr
```

Scan the displayed QR code with Even G2 to connect.

### Build & Package

```bash
npm run build
npm run pack
```

## Project Structure

```
├── g2/
│   ├── index.ts        # App module definition
│   ├── main.ts         # Bridge connection and entry point
│   ├── app.ts          # Game lifecycle and event handlers
│   ├── game.ts         # Core game logic (slide, merge, game over)
│   ├── board-text.ts   # Unicode text rendering (①-⑳, borders)
│   ├── renderer.ts     # Even Hub SDK container management
│   ├── state.ts        # Game state and localStorage persistence
│   ├── layout.ts       # Display constants and animation parameters
│   ├── events.ts       # Event handling
│   └── animation.ts    # Animation utilities
├── _shared/
│   ├── app-types.ts    # Shared type definitions
│   └── log.ts          # Logging utility
├── index.html          # Entry point
├── app.json            # Even Hub app manifest
├── vite.config.ts      # Vite config
└── package.json
```

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Even Hub SDK](https://www.npmjs.com/package/@evenrealities/even_hub_sdk) (`@evenrealities/even_hub_sdk`)

## Architecture

The game uses 4 text containers (the G2 maximum):

| Container | ID | Purpose |
|-----------|----|---------|
| evt | 1 | Invisible event capture (full screen) |
| header | 2 | Score, high score, max tile, controls guide |
| static | 3 | Board with borders and stationary tiles |
| moving | 4 | Animated tiles (pixel-offset during slides) |

During slide animations, the `moving` container is shifted by pixel offsets (`xPosition` / `yPosition`) to create smooth tile movement without rebuilding text each frame.
