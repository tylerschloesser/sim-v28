import { generateWorld } from "./worldGen";
import { updateViewport, updateVisibleChunks } from "./viewportUtils";
import type { AppState } from "./types";
import { WORLD_SIZE, TILE_SIZE } from "./constants";

export function initializeAppState(): AppState {
  const world = generateWorld(WORLD_SIZE);
  const worldCenterX = (WORLD_SIZE * TILE_SIZE) / 2;
  const worldCenterY = (WORLD_SIZE * TILE_SIZE) / 2;

  const state: AppState = {
    player: { x: worldCenterX, y: worldCenterY, vx: 0, vy: 0 },
    world,
    viewport: { x: 0, y: 0, width: 0, height: 0 },
    visibleChunks: { minChunkX: 0, maxChunkX: 0, minChunkY: 0, maxChunkY: 0 },
    action: null,
    inventory: {
      stone: 10,
      wood: 0,
      iron: 0,
      copper: 0,
      coal: 0,
      "stone-furnace": 0,
      "wood-storage": 0,
    },
    inventoryOpen: false,
    craftQueue: [],
  };

  // Calculate initial viewport and chunks
  updateViewport(state);
  updateVisibleChunks(state);

  return state;
}
