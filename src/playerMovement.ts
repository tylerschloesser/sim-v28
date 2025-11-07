import type { MovementInput, MovementResult } from "./types";
import { COLLISION_PADDING, TILE_SIZE } from "./constants";

/**
 * Pure function that calculates player movement with collision detection.
 * Prevents movement into covered tiles using a padding buffer.
 * Allows sliding along walls by moving as close as possible to boundaries.
 * Does not mutate any input - returns new position and collision state.
 */
export function calculateMovementAndCollision(
  input: MovementInput,
): MovementResult {
  const { currentX, currentY, dx, dy, world } = input;
  const newCollidingTiles = new Set<string>();

  // Helper function to check if a position overlaps a covered tile
  const isPositionCovered = (x: number, y: number): boolean => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    // Check bounds
    if (
      tileY < 0 ||
      tileY >= world.length ||
      tileX < 0 ||
      tileX >= world[0].length
    ) {
      return true; // Treat out of bounds as covered
    }

    return world[tileY][tileX].covered;
  };

  // Handle X-axis movement with padding
  let finalDx = dx;
  if (dx !== 0) {
    const newX = currentX + dx;
    const checkX = newX + (dx > 0 ? COLLISION_PADDING : -COLLISION_PADDING);

    if (isPositionCovered(checkX, currentY)) {
      newCollidingTiles.add(
        `${Math.floor(checkX / TILE_SIZE)},${Math.floor(currentY / TILE_SIZE)}`,
      );

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

    if (isPositionCovered(currentX, checkY)) {
      newCollidingTiles.add(
        `${Math.floor(currentX / TILE_SIZE)},${Math.floor(checkY / TILE_SIZE)}`,
      );

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

  // Return new position and collision state (pure - no mutations)
  return {
    x: currentX + finalDx,
    y: currentY + finalDy,
    collidingTiles: newCollidingTiles,
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
