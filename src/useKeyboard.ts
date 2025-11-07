import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import {
  MINE_TIME_MS,
  PLAYER_ACCELERATION,
  PLAYER_SPEED,
  TILE_SIZE,
  UNCOVER_TIME_MS,
} from "./constants";
import {
  calculateMovementAndCollision,
  processMovementInput,
} from "./playerMovement";
import { tileToId } from "./tileUtils";
import type { AppState } from "./types";
import { updateViewport, updateVisibleChunks } from "./viewportUtils";

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
      // Toggle inventory with 'e' key
      if (key === "e") {
        setState((draft) => {
          draft.inventoryOpen = !draft.inventoryOpen;
        });
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
  }, [setState]);

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

          // Update viewport and visible chunks
          updateViewport(draft);
          updateVisibleChunks(draft);
        }

        // Get player's current tile position
        const playerTileX = Math.floor(draft.player.x / TILE_SIZE);
        const playerTileY = Math.floor(draft.player.y / TILE_SIZE);
        const currentTileId = tileToId(playerTileX, playerTileY);
        const tile = draft.world[playerTileY]?.[playerTileX];

        // Determine what action is available at current position
        let availableAction: "uncover" | "mine" | null = null;
        if (tile) {
          if (tile.covered) {
            // Covered tiles take priority - must uncover before mining
            availableAction = "uncover";
          } else if (tile.resource) {
            // Uncovered tiles with resources can be mined
            availableAction = "mine";
          }
        }

        // Set action proactively when available action changes or player moves tiles
        if (availableAction) {
          // Check if we need to create/update the action
          if (
            !draft.action ||
            draft.action.tileId !== currentTileId ||
            draft.action.type !== availableAction
          ) {
            // Initialize new action at current position
            draft.action = {
              type: availableAction,
              tileId: currentTileId,
              progress: 0,
            };
          }
        } else {
          // No available action - clear action
          draft.action = null;
        }

        // Make progress on action only when spacebar is pressed
        const spacebarPressed = keysPressed.current.has(" ");
        if (spacebarPressed && draft.action) {
          const actionTimeMs =
            draft.action.type === "mine" ? MINE_TIME_MS : UNCOVER_TIME_MS;
          const progressIncrement = deltaTime / (actionTimeMs / 1000);
          draft.action.progress += progressIncrement;

          // Check if action is complete
          if (draft.action.progress >= 1) {
            if (draft.action.type === "mine" && tile?.resource) {
              // Add resource to inventory
              draft.inventory[tile.resource] += 1;
              // Reset progress to remainder for continuous mining
              draft.action.progress = draft.action.progress - 1.0;
            } else if (draft.action.type === "uncover" && tile) {
              // Uncover the tile
              tile.covered = false;
              // Clear action (uncovering is one-time)
              draft.action = null;
            }
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
