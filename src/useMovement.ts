import { useEffect } from "react";
import type { Updater } from "use-immer";
import { TILE_SIZE } from "./constants";
import { calculateMovementAndCollision } from "./playerMovement";
import type { AppState } from "./types";
import { updateViewport, updateVisibleChunks } from "./viewportUtils";

interface UseMovementOptions {
  setState: Updater<AppState>;
}

/**
 * Hook that applies player velocity to position in an animation loop.
 * This handles the movement application and collision detection.
 * Velocity should be set by input handlers (keyboard, joystick, etc.)
 */
export function useMovement({ setState }: UseMovementOptions) {
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const updatePlayer = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      setState((draft) => {
        const { vx, vy } = draft.player;

        // Calculate movement with collision detection if there's any velocity
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
            world: draft.tiles,
          });

          // Apply mutations to draft
          draft.player.x = result.x;
          draft.player.y = result.y;

          // Update viewport and visible chunks
          updateViewport(draft);
          updateVisibleChunks(draft);
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
