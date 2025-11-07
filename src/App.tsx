import { useMemo } from "react";
import { generateWorld } from "./worldGen";
import { TileGrid } from "./TileGrid";

// Configuration constants
const WORLD_SIZE = 256;
const TILE_SIZE = 32;

export function App() {
  // Generate world once on mount
  const world = useMemo(() => generateWorld(WORLD_SIZE), []);

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
      <TileGrid world={world} tileSize={TILE_SIZE} />
    </svg>
  );
}
