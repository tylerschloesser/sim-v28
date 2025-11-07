import type { AppState } from "./types";
import { TILE_SIZE, CHUNK_SIZE } from "./constants";

/**
 * Mutates the viewport in the draft state based on player position.
 * Uses immer's draft pattern for efficient state updates.
 */
export function updateViewport(draft: AppState): void {
  draft.viewport.x = draft.player.x - window.innerWidth / 2;
  draft.viewport.y = draft.player.y - window.innerHeight / 2;
  draft.viewport.width = window.innerWidth;
  draft.viewport.height = window.innerHeight;
}

/**
 * Mutates the visible chunks in the draft state based on viewport.
 * Uses immer's draft pattern for efficient state updates.
 */
export function updateVisibleChunks(draft: AppState): void {
  const chunkSizePixels = CHUNK_SIZE * TILE_SIZE;
  const { viewport } = draft;

  // Calculate which chunks are visible
  // Floor for min (rounds down to chunk boundary)
  // Ceil for max (rounds up to include partial chunks)
  draft.visibleChunks.minChunkX = Math.max(
    0,
    Math.floor(viewport.x / chunkSizePixels),
  );
  draft.visibleChunks.maxChunkX = Math.ceil(
    (viewport.x + viewport.width) / chunkSizePixels,
  );
  draft.visibleChunks.minChunkY = Math.max(
    0,
    Math.floor(viewport.y / chunkSizePixels),
  );
  draft.visibleChunks.maxChunkY = Math.ceil(
    (viewport.y + viewport.height) / chunkSizePixels,
  );
}
