import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import {
  MINE_TIME_MS,
  PLAYER_ACCELERATION,
  PLAYER_SPEED,
  TILE_SIZE,
} from "./constants";
import {
  calculateMovementAndCollision,
  processMovementInput,
} from "./playerMovement";
import type { AppState } from "./types";
import { updateViewport, updateVisibleChunks } from "./viewportUtils";
import { isEqual } from "lodash-es";

interface UseKeyboardOptions {
  setState: Updater<AppState>;
}

export function useKeyboard({ setState }: UseKeyboardOptions) {
  const keysPressed = useRef<Set<string>>(new Set());

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", " "].includes(key)) {
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
        // Process movement input and update velocity
        const { vx, vy } = processMovementInput(
          keysPressed.current,
          draft.player.vx,
          draft.player.vy,
          deltaTime,
          PLAYER_ACCELERATION,
          PLAYER_SPEED,
        );

        // Apply velocity to draft
        draft.player.vx = vx;
        draft.player.vy = vy;

        // Calculate movement with collision detection
        if (vx !== 0 || vy !== 0) {
          // Convert velocity in tiles/s to pixels by multiplying by TILE_SIZE
          // Then multiply by deltaTime to get distance traveled this frame
          const dx = vx * TILE_SIZE * deltaTime;
          const dy = vy * TILE_SIZE * deltaTime;

          // Call pure function with readonly state
          const result = calculateMovementAndCollision({
            currentX: draft.player.x,
            currentY: draft.player.y,
            dx,
            dy,
            world: draft.world,
          });

          // Apply mutations to draft
          draft.player.x = result.x;
          draft.player.y = result.y;

          if (!isEqual(draft.collidingTiles, result.collidingTiles)) {
            draft.collidingTiles = result.collidingTiles;
          }

          // Update viewport and visible chunks
          updateViewport(draft);
          updateVisibleChunks(draft);
        } else {
          // Clear colliding tiles when not moving
          if (draft.collidingTiles.size > 0) {
            draft.collidingTiles.clear();
          }
        }

        // Handle mining action
        const spacebarPressed = keysPressed.current.has(" ");

        // Only allow mining when not colliding with any tiles
        if (spacebarPressed && draft.collidingTiles.size === 0) {
          // Get player's current tile
          const playerTileX = Math.floor(draft.player.x / TILE_SIZE);
          const playerTileY = Math.floor(draft.player.y / TILE_SIZE);
          const currentTileId = `${playerTileX},${playerTileY}`;
          const tile = draft.world[playerTileY]?.[playerTileX];

          // Check if tile is uncovered and has a resource
          if (tile && !tile.covered && tile.resource) {
            // Check if we need to start a new mining action
            if (
              !draft.action ||
              draft.action.tileId !== currentTileId ||
              draft.action.type !== "mine"
            ) {
              // Initialize new mine action
              draft.action = {
                type: "mine",
                tileId: currentTileId,
                progress: 0,
              };
            } else {
              // Continue existing mine action
              const progressIncrement = deltaTime / (MINE_TIME_MS / 1000);
              draft.action.progress += progressIncrement;

              // Check if mining cycle is complete
              if (draft.action.progress >= 1) {
                // Add resource to inventory
                draft.inventory[tile.resource] += 1;

                // Reset progress to remainder for continuous mining
                draft.action.progress = draft.action.progress - 1.0;
              }
            }
          } else {
            // Clear mine action if conditions not met
            if (draft.action?.type === "mine") {
              draft.action = null;
            }
          }
        } else {
          // Clear mine action if spacebar not pressed or colliding
          if (draft.action?.type === "mine") {
            draft.action = null;
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
