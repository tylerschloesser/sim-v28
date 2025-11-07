import type { MovementInput, MovementResult, ReadonlyWorld } from "./types";
import { COLLISION_PADDING, TILE_SIZE } from "./constants";

/**
 * Helper function to check if a tile at given coordinates is uncovered.
 * Returns false for out-of-bounds tiles.
 */
function isTileUncovered(
  tileX: number,
  tileY: number,
  world: ReadonlyWorld,
): boolean {
  if (
    tileY < 0 ||
    tileY >= world.length ||
    tileX < 0 ||
    tileX >= world[0].length
  ) {
    return false; // Out of bounds is not uncovered
  }
  return !world[tileY][tileX].covered;
}

/**
 * Checks if a covered tile is orthogonally adjacent to at least one uncovered tile.
 * Used for rendering gray adjacent tiles and determining walkability.
 */
export function isCoveredTileAdjacentToUncovered(
  tileX: number,
  tileY: number,
  world: ReadonlyWorld,
): boolean {
  // Must be in bounds
  if (
    tileY < 0 ||
    tileY >= world.length ||
    tileX < 0 ||
    tileX >= world[0].length
  ) {
    return false;
  }

  const tile = world[tileY][tileX];

  // Must be covered
  if (!tile.covered) {
    return false;
  }

  // Check if any orthogonally adjacent tile is uncovered
  const adjacentOffsets = [
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
  ];

  for (const { dx, dy } of adjacentOffsets) {
    if (isTileUncovered(tileX + dx, tileY + dy, world)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a tile is walkable: either uncovered, or covered but adjacent to an uncovered tile.
 * Adjacency is orthogonal only (up/down/left/right, not diagonal).
 */
function isTileWalkable(
  tileX: number,
  tileY: number,
  world: ReadonlyWorld,
): boolean {
  // Out of bounds is not walkable
  if (
    tileY < 0 ||
    tileY >= world.length ||
    tileX < 0 ||
    tileX >= world[0].length
  ) {
    return false;
  }

  const tile = world[tileY][tileX];

  // If uncovered, it's walkable
  if (!tile.covered) {
    return true;
  }

  // If covered, check if adjacent to uncovered
  return isCoveredTileAdjacentToUncovered(tileX, tileY, world);
}

/**
 * Pure function that calculates player movement with collision detection.
 * Prevents movement into non-walkable tiles using a padding buffer.
 * Allows sliding along walls by moving as close as possible to boundaries.
 * Does not mutate any input - returns new position.
 */
export function calculateMovementAndCollision(
  input: MovementInput,
): MovementResult {
  const { currentX, currentY, dx, dy, world } = input;

  // Helper function to check if a position overlaps a non-walkable tile
  const isPositionBlocked = (x: number, y: number): boolean => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    return !isTileWalkable(tileX, tileY, world);
  };

  // Handle X-axis movement with padding
  let finalDx = dx;
  if (dx !== 0) {
    const newX = currentX + dx;
    const checkX = newX + (dx > 0 ? COLLISION_PADDING : -COLLISION_PADDING);

    if (isPositionBlocked(checkX, currentY)) {
      // Calculate the tile boundary we're approaching
      const targetTileX =
        dx > 0 ? Math.floor(checkX / TILE_SIZE) : Math.ceil(checkX / TILE_SIZE);
      const boundaryX = targetTileX * TILE_SIZE;

      // Calculate max distance we can move (to padding distance from boundary)
      const maxDistance =
        dx > 0
          ? boundaryX - COLLISION_PADDING - currentX
          : boundaryX + COLLISION_PADDING - currentX;

      // Use the smaller of requested movement or max allowed distance
      finalDx = Math.abs(dx) < Math.abs(maxDistance) ? dx : maxDistance;
    }
  }

  // Handle Y-axis movement with padding
  let finalDy = dy;
  if (dy !== 0) {
    const newY = currentY + dy;
    const checkY = newY + (dy > 0 ? COLLISION_PADDING : -COLLISION_PADDING);

    if (isPositionBlocked(currentX, checkY)) {
      // Calculate the tile boundary we're approaching
      const targetTileY =
        dy > 0 ? Math.floor(checkY / TILE_SIZE) : Math.ceil(checkY / TILE_SIZE);
      const boundaryY = targetTileY * TILE_SIZE;

      // Calculate max distance we can move (to padding distance from boundary)
      const maxDistance =
        dy > 0
          ? boundaryY - COLLISION_PADDING - currentY
          : boundaryY + COLLISION_PADDING - currentY;

      // Use the smaller of requested movement or max allowed distance
      finalDy = Math.abs(dy) < Math.abs(maxDistance) ? dy : maxDistance;
    }
  }

  // Return new position (pure - no mutations)
  return {
    x: currentX + finalDx,
    y: currentY + finalDy,
  };
}

/**
 * Processes keyboard input and calculates player velocity with acceleration.
 * Returns updated velocity values based on input direction and deltaTime.
 */
export function processMovementInput(
  keysPressed: Set<string>,
  currentVx: number,
  currentVy: number,
  deltaTime: number,
  acceleration: number,
  maxSpeed: number,
): { vx: number; vy: number } {
  let inputX = 0;
  let inputY = 0;

  if (keysPressed.has("w")) inputY -= 1;
  if (keysPressed.has("s")) inputY += 1;
  if (keysPressed.has("a")) inputX -= 1;
  if (keysPressed.has("d")) inputX += 1;

  // Normalize input direction for diagonal movement
  const inputMagnitude = Math.sqrt(inputX * inputX + inputY * inputY);
  if (inputMagnitude > 0) {
    inputX /= inputMagnitude;
    inputY /= inputMagnitude;
  }

  // Apply acceleration or stop per axis based on input
  let vx = currentVx;
  let vy = currentVy;

  if (inputX !== 0) {
    vx += inputX * acceleration * deltaTime;
  } else {
    // Stop immediately when no input on this axis
    vx = 0;
  }

  if (inputY !== 0) {
    vy += inputY * acceleration * deltaTime;
  } else {
    // Stop immediately when no input on this axis
    vy = 0;
  }

  // Clamp velocity to max speed (tiles/s)
  const currentSpeed = Math.sqrt(vx * vx + vy * vy);
  if (currentSpeed > maxSpeed) {
    vx = (vx / currentSpeed) * maxSpeed;
    vy = (vy / currentSpeed) * maxSpeed;
  }

  return { vx, vy };
}
