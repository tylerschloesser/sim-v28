import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import type { AppState } from "./types";

const MINE_TIME_MS = 1000; // 1 second to mine a tile

interface UseMiningProps {
  setState: Updater<AppState>;
}

export function useMining({ setState }: UseMiningProps) {
  const lastFrameTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const now = Date.now();
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      setState((draft) => {
        // Get the single colliding tile if exactly one exists
        const collidingTileIds = Array.from(draft.collidingTiles);

        if (collidingTileIds.length !== 1) {
          // Clear action if not colliding with exactly one tile
          draft.action = null;
          return;
        }

        const currentTileId = collidingTileIds[0];

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
          return;
        }

        // Increment progress based on delta time
        const progressIncrement = deltaTime / MINE_TIME_MS;
        draft.action.progress += progressIncrement;

        // Check if mining is complete
        if (draft.action.progress >= 1) {
          // Parse tileId to get coordinates (format: "x,y")
          const [tileX, tileY] = currentTileId.split(",").map(Number);

          // Uncover the tile
          if (
            draft.world[tileY] &&
            draft.world[tileY][tileX] &&
            draft.world[tileY][tileX].covered
          ) {
            draft.world[tileY][tileX].covered = false;
          }

          // Clear the action
          draft.action = null;
        }
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [setState]);
}
