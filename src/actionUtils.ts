import type { AppState } from "./types";

export type ActionType = "destroy-entity" | "uncover" | "mine";

/**
 * Determines what action is available at the player's current position.
 * Priority order: entity > covered tile > resource
 *
 * @param playerTileX - The player's current tile X coordinate
 * @param playerTileY - The player's current tile Y coordinate
 * @param state - The full application state
 * @returns The action type available, or null if no action is available
 */
export function getAvailableAction(
  playerTileX: number,
  playerTileY: number,
  state: AppState,
): ActionType | null {
  const tile = state.tiles[playerTileY]?.[playerTileX];
  if (!tile) return null;

  // Priority 1: Check for entity
  if (tile.entityId) {
    return "destroy-entity";
  }

  // Priority 2: Check if covered
  if (tile.covered) {
    return "uncover";
  }

  // Priority 3: Check for resource
  if (tile.resource) {
    return "mine";
  }

  // No action available
  return null;
}
