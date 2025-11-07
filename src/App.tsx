import { useMemo } from "react";
import { generateWorld } from "./worldGen";

// Configuration constants
const WORLD_SIZE = 256;
const TILE_SIZE = 32;

export function App() {
  // Generate world once on mount
  const world = useMemo(() => generateWorld(WORLD_SIZE), []);

  const canvasWidth = WORLD_SIZE * TILE_SIZE;
  const canvasHeight = WORLD_SIZE * TILE_SIZE;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000000",
      }}
    >
      {world.map((row, y) =>
        row.map((tile, x) => (
          <rect
            key={`${x}-${y}`}
            x={x * TILE_SIZE}
            y={y * TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill={tile.color}
          />
        )),
      )}
    </svg>
  );
}
