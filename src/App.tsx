import { useMemo, useState, useEffect, useRef } from "react";
import { generateWorld } from "./worldGen";
import { TileGrid } from "./TileGrid";
import type { Camera } from "./types";

// Configuration constants
const WORLD_SIZE = 128;
const TILE_SIZE = 32;
const CAMERA_SPEED = 5; // pixels per frame

export function App() {
  // Generate world once on mount
  const world = useMemo(() => generateWorld(WORLD_SIZE), []);

  // Camera starts at center of world
  const worldCenterX = (WORLD_SIZE * TILE_SIZE) / 2;
  const worldCenterY = (WORLD_SIZE * TILE_SIZE) / 2;

  const [camera, setCamera] = useState<Camera>({
    x: worldCenterX,
    y: worldCenterY,
  });

  // Track which keys are currently pressed
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

  // Animation loop for smooth camera movement
  useEffect(() => {
    let animationFrameId: number;

    const updateCamera = () => {
      setCamera((prev) => {
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
        dx = (dx / magnitude) * CAMERA_SPEED;
        dy = (dy / magnitude) * CAMERA_SPEED;

        return {
          x: prev.x + dx,
          y: prev.y + dy,
        };
      });

      animationFrameId = requestAnimationFrame(updateCamera);
    };

    animationFrameId = requestAnimationFrame(updateCamera);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000000",
      }}
    >
      <g
        transform={`translate(${window.innerWidth / 2 - camera.x}, ${window.innerHeight / 2 - camera.y})`}
      >
        <TileGrid world={world} tileSize={TILE_SIZE} />
      </g>
    </svg>
  );
}
