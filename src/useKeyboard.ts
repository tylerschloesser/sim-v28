import { useState, useEffect, useRef } from "react";
import type { Player } from "./types";

interface UseKeyboardOptions {
  speed: number;
  initialPosition: Player;
}

export function useKeyboard({ speed, initialPosition }: UseKeyboardOptions) {
  const [player, setPlayer] = useState<Player>(initialPosition);
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
      setPlayer((prev) => {
        let dx = 0;
        let dy = 0;

        if (keysPressed.current.has("w")) dy -= 1;
        if (keysPressed.current.has("s")) dy += 1;
        if (keysPressed.current.has("a")) dx -= 1;
        if (keysPressed.current.has("d")) dx += 1;

        // Only update if there's movement
        if (dx === 0 && dy === 0) return prev;

        // Normalize diagonal movement
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / magnitude) * speed;
        dy = (dy / magnitude) * speed;

        return {
          x: prev.x + dx,
          y: prev.y + dy,
        };
      });

      animationFrameId = requestAnimationFrame(updatePlayer);
    };

    animationFrameId = requestAnimationFrame(updatePlayer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  return player;
}
