import { useEffect, useRef } from "react";
import type { Updater } from "use-immer";
import type { AppState } from "./types";

interface UseKeyboardOptions {
  speed: number;
  setState: Updater<AppState>;
}

export function useKeyboard({ speed, setState }: UseKeyboardOptions) {
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
        dx = (dx / magnitude) * speed;
        dy = (dy / magnitude) * speed;

        setState((draft) => {
          draft.player.x += dx;
          draft.player.y += dy;
        });
      }

      animationFrameId = requestAnimationFrame(updatePlayer);
    };

    animationFrameId = requestAnimationFrame(updatePlayer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, setState]);
}
