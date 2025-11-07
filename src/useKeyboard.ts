import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import type { AppState } from "./types";
import {
  COLLISION_PADDING,
  PLAYER_SPEED,
  PLAYER_ACCELERATION,
  TILE_SIZE,
} from "./constants";
import { isEqual } from "lodash-es";
import { updateViewport, updateVisibleChunks } from "./viewportUtils";

interface UseKeyboardOptions {
  setState: Updater<AppState>;
}

/**
 * Calculates and applies player movement with collision detection.
 * Prevents movement into covered tiles using a padding buffer.
 * Allows sliding along walls by moving as close as possible to boundaries.
 */
function applyPlayerMovement(draft: AppState, dx: number, dy: number): void {
  const { player, world } = draft;
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

  const startX = player.x;
  const startY = player.y;

  // Handle X-axis movement with padding
  let finalDx = dx;
  if (dx !== 0) {
    const newX = startX + dx;
    const checkX = newX + (dx > 0 ? COLLISION_PADDING : -COLLISION_PADDING);

    if (isPositionCovered(checkX, startY)) {
      newCollidingTiles.add(
        `${Math.floor(checkX / TILE_SIZE)},${Math.floor(startY / TILE_SIZE)}`,
      );

      // Calculate the tile boundary we're approaching
      const targetTileX =
        dx > 0 ? Math.floor(checkX / TILE_SIZE) : Math.ceil(checkX / TILE_SIZE);
      const boundaryX = targetTileX * TILE_SIZE;

      // Calculate max distance we can move (to padding distance from boundary)
      const maxDistance =
        dx > 0
          ? boundaryX - COLLISION_PADDING - startX
          : boundaryX + COLLISION_PADDING - startX;

      // Use the smaller of requested movement or max allowed distance
      finalDx = Math.abs(dx) < Math.abs(maxDistance) ? dx : maxDistance;
    }
  }

  // Handle Y-axis movement with padding
  let finalDy = dy;
  if (dy !== 0) {
    const newY = startY + dy;
    const checkY = newY + (dy > 0 ? COLLISION_PADDING : -COLLISION_PADDING);

    if (isPositionCovered(startX, checkY)) {
      newCollidingTiles.add(
        `${Math.floor(startX / TILE_SIZE)},${Math.floor(checkY / TILE_SIZE)}`,
      );

      // Calculate the tile boundary we're approaching
      const targetTileY =
        dy > 0 ? Math.floor(checkY / TILE_SIZE) : Math.ceil(checkY / TILE_SIZE);
      const boundaryY = targetTileY * TILE_SIZE;

      // Calculate max distance we can move (to padding distance from boundary)
      const maxDistance =
        dy > 0
          ? boundaryY - COLLISION_PADDING - startY
          : boundaryY + COLLISION_PADDING - startY;

      // Use the smaller of requested movement or max allowed distance
      finalDy = Math.abs(dy) < Math.abs(maxDistance) ? dy : maxDistance;
    }
  }

  if (!isEqual(draft.collidingTiles, newCollidingTiles)) {
    draft.collidingTiles = newCollidingTiles;
  }

  // Apply the allowed movement
  draft.player.x += finalDx;
  draft.player.y += finalDy;

  // Recalculate viewport and visible chunks
  updateViewport(draft);
  updateVisibleChunks(draft);
}

export function useKeyboard({ setState }: UseKeyboardOptions) {
  const keysPressed = useRef<Set<string>>(new Set());

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Animation loop for smooth player movement with acceleration
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const updatePlayer = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      setState((draft) => {
        let inputX = 0;
        let inputY = 0;

        if (keysPressed.current.has("w")) inputY -= 1;
        if (keysPressed.current.has("s")) inputY += 1;
        if (keysPressed.current.has("a")) inputX -= 1;
        if (keysPressed.current.has("d")) inputX += 1;

        // Normalize input direction for diagonal movement
        const inputMagnitude = Math.sqrt(inputX * inputX + inputY * inputY);
        if (inputMagnitude > 0) {
          inputX /= inputMagnitude;
          inputY /= inputMagnitude;
        }

        // Apply acceleration or stop per axis based on input
        if (inputX !== 0) {
          draft.player.vx += inputX * PLAYER_ACCELERATION * deltaTime;
        } else {
          // Stop immediately when no input on this axis
          draft.player.vx = 0;
        }

        if (inputY !== 0) {
          draft.player.vy += inputY * PLAYER_ACCELERATION * deltaTime;
        } else {
          // Stop immediately when no input on this axis
          draft.player.vy = 0;
        }

        // Clamp velocity to max speed (tiles/s)
        const currentSpeed = Math.sqrt(
          draft.player.vx * draft.player.vx + draft.player.vy * draft.player.vy,
        );
        if (currentSpeed > PLAYER_SPEED) {
          draft.player.vx = (draft.player.vx / currentSpeed) * PLAYER_SPEED;
          draft.player.vy = (draft.player.vy / currentSpeed) * PLAYER_SPEED;
        }

        // Apply movement using velocity (tiles/s) and delta time (s)
        if (draft.player.vx !== 0 || draft.player.vy !== 0) {
          // Convert velocity in tiles/s to pixels by multiplying by TILE_SIZE
          // Then multiply by deltaTime to get distance traveled this frame
          const dx = draft.player.vx * TILE_SIZE * deltaTime;
          const dy = draft.player.vy * TILE_SIZE * deltaTime;
          applyPlayerMovement(draft, dx, dy);
        } else {
          // Clear colliding tiles when not moving
          if (draft.collidingTiles.size > 0) {
            draft.collidingTiles.clear();
          }
        }
      });

      animationFrameId = requestAnimationFrame(updatePlayer);
    };

    animationFrameId = requestAnimationFrame(updatePlayer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [setState]);
}
