# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use `bun` instead of `npm` for all package management operations.

## Development Commands

- **Install dependencies**: `bun install`
- **Start dev server**: `bun run dev` (do not run this yourself)
- **Build for production**: `bun run build`
- **After code changes**: `bun run check` (auto-fixes lint & prettier, runs type checks - always use this)
- **Type checking only**: `tsc --noEmit` (use this if you only need type validation)
- **Lint**: `bun run lint`
- **Preview production build**: `bun run preview`

## TypeScript Configuration

The project uses a composite TypeScript configuration with project references:

- `tsconfig.json` - Root configuration file
- `tsconfig.app.json` - Configuration for application source code in `src/`
- `tsconfig.node.json` - Configuration for Node.js tooling files

**IMPORTANT**: Always run `bun run check` after making code changes. This command will auto-fix lint and prettier issues, then run type checks. Only use `tsc --noEmit` directly if you specifically need type validation without formatting.

## Application Architecture

This is a 2D tile-based simulation with player movement and collision detection, built with React 19 + TypeScript + Vite.

### Core Concepts

**State Management**: Uses `use-immer` for immutable state updates. The entire application state (`AppState`) is managed in `App.tsx` and passed down to components. State includes player position, world tiles, viewport bounds, visible chunks, and collision information.

**Coordinate Systems**: Two coordinate systems coexist:
- **World coordinates**: Absolute pixel positions in the world (player position, viewport bounds)
- **Tile coordinates**: Grid indices for the tile array (accessed via `world[tileY][tileX]`)
- Convert between them using `TILE_SIZE` constant (32 pixels per tile)

**Chunk-Based Rendering**: World is divided into chunks (16x16 tiles each, defined by `CHUNK_SIZE`). Only visible chunks are rendered to optimize performance. The viewport system (`viewportUtils.ts`) calculates which chunks are visible based on player position, and `TileGrid.tsx` renders only those chunks.

**Collision Detection**: Player movement (`useKeyboard.ts`) checks tiles ahead with padding (`COLLISION_PADDING`). When movement would enter a covered tile, the player stops at the boundary but can slide along walls by moving as close as possible. Colliding tiles are highlighted via `CollisionHighlight.tsx`.

**Movement System**: `useKeyboard.ts` handles WASD input using `requestAnimationFrame` for smooth movement. Diagonal movement is normalized to maintain consistent speed (`PLAYER_SPEED`). Movement mutates draft state using immer, then recalculates viewport and visible chunks.

**Rendering**: SVG-based rendering with a camera transform that centers the player. The world transforms to keep player centered on screen, while the player dot itself stays at screen center (`window.innerWidth/2`, `window.innerHeight/2`).

### Key Files

- `App.tsx` - Root component, initializes state, orchestrates all systems
- `types.ts` - Core type definitions (`AppState`, `World`, `Player`, `Viewport`, `ChunkBounds`)
- `constants.ts` - Configuration values (`WORLD_SIZE`, `TILE_SIZE`, `CHUNK_SIZE`, `PLAYER_SPEED`, `COLLISION_PADDING`)
- `worldGen.ts` - Generates initial world with covered/uncovered tiles
- `useKeyboard.ts` - Handles player input, movement, and collision detection
- `viewportUtils.ts` - Calculates viewport bounds and visible chunks (mutates immer draft state)
- `TileGrid.tsx` - Renders visible chunks with memoization for performance
- `CollisionHighlight.tsx` - Visualizes tiles the player is colliding with
- `DebugOverlay.tsx` - Shows player position, viewport, chunks, and collision info

### Important Patterns

- **Immer mutations**: Functions in `viewportUtils.ts` and movement logic directly mutate draft state. This is intentional and correct when using immer.
- **Memoization**: `TileGrid` and `TileChunk` components use `memo()` to prevent unnecessary re-renders since the world array is stable.
- **Viewport updates**: After any player movement, always call `updateViewport()` and `updateVisibleChunks()` to keep rendering in sync.
- **Chunk key stability**: Chunk keys like `chunk-${chunkX}-${chunkY}` must remain stable across renders for React optimization.

## Technology Stack

- **React**: v19.1.1 (latest with new features)
- **Vite**: v7.1.7 (build tool with HMR)
- **TypeScript**: v5.9.3 (strict mode enabled)
- **ESLint**: v9.36.0 with React Hooks and React Refresh plugins
- **Immer/use-immer**: v10.2.0/v0.11.0 for immutable state updates
- **lodash-es**: v4.17.21 (used for `isEqual` in collision detection)

## Build Tool Details

This project uses Vite with the following configuration:

- `@vitejs/plugin-react` for Fast Refresh with Babel
- Dev server with HMR (Hot Module Replacement)
- Production builds use `tsc -b` for TypeScript compilation followed by `vite build`

## Code Quality

ESLint is configured with:

- TypeScript ESLint recommended rules
- React Hooks recommended rules
- React Refresh rules for Vite
- Browser globals

TypeScript is configured with strict mode and additional checks:

- `noUnusedLocals` and `noUnusedParameters` enabled
- `noFallthroughCasesInSwitch` enabled
- `noUncheckedSideEffectImports` enabled
