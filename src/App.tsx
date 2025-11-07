import { useMemo } from "react";
import { generateWorld } from "./worldGen";
import { TileGrid } from "./TileGrid";
import { useKeyboard } from "./useKeyboard";

// Configuration constants
const WORLD_SIZE = 128;
const TILE_SIZE = 32;
const PLAYER_SPEED = 5; // pixels per frame

export function App() {
  // Generate world once on mount
  const world = useMemo(() => generateWorld(WORLD_SIZE), []);

  // Player starts at center of world
  const worldCenterX = (WORLD_SIZE * TILE_SIZE) / 2;
  const worldCenterY = (WORLD_SIZE * TILE_SIZE) / 2;

  const player = useKeyboard({
    speed: PLAYER_SPEED,
    initialPosition: { x: worldCenterX, y: worldCenterY },
  });

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
        transform={`translate(${window.innerWidth / 2 - player.x}, ${window.innerHeight / 2 - player.y})`}
      >
        <TileGrid world={world} tileSize={TILE_SIZE} />
      </g>
      <circle
        cx={window.innerWidth / 2}
        cy={window.innerHeight / 2}
        r={4}
        fill="#0000ff"
      />
    </svg>
  );
}
