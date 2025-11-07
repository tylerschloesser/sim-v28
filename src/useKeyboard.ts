import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import type { AppState } from "./types";
import { PLAYER_SPEED, TILE_SIZE } from "./constants";

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

  // Animation loop for smooth player movement
  useEffect(() => {
    let animationFrameId: number;

    const updatePlayer = () => {
      let dx = 0;
      let dy = 0;

      if (keysPressed.current.has("w")) dy -= 1;
      if (keysPressed.current.has("s")) dy += 1;
      if (keysPressed.current.has("a")) dx -= 1;
      if (keysPressed.current.has("d")) dx += 1;

      // Only update if there's movement
      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal movement
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / magnitude) * PLAYER_SPEED;
        dy = (dy / magnitude) * PLAYER_SPEED;

        setState((draft) => {
          const { player, world } = draft;

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

          // Current position is assumed to be on an uncovered tile
          const startX = player.x;
          const startY = player.y;

          // Try applying X movement only
          let finalDx = dx;
          const newX = startX + dx;
          if (isPositionCovered(newX, startY)) {
            finalDx = 0; // Block X movement if it would enter a covered tile
          }

          // Try applying Y movement only
          let finalDy = dy;
          const newY = startY + dy;
          if (isPositionCovered(startX, newY)) {
            finalDy = 0; // Block Y movement if it would enter a covered tile
          }

          // Apply the allowed movement
          draft.player.x += finalDx;
          draft.player.y += finalDy;
        });
      }

      animationFrameId = requestAnimationFrame(updatePlayer);
    };

    animationFrameId = requestAnimationFrame(updatePlayer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [setState]);
}
