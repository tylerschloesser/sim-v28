import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import { PLAYER_ACCELERATION, PLAYER_SPEED, TILE_SIZE } from "./constants";
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
      });

      animationFrameId = requestAnimationFrame(updatePlayer);
    };

    animationFrameId = requestAnimationFrame(updatePlayer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [setState]);
}
