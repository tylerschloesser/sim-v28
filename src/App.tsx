import { useImmer } from "use-immer";
import { generateWorld } from "./worldGen";
import { TileGrid } from "./TileGrid";
import { useKeyboard } from "./useKeyboard";
import type { AppState } from "./types";

// Configuration constants
const WORLD_SIZE = 128;
const TILE_SIZE = 32;
const PLAYER_SPEED = 5; // pixels per frame

function initializeAppState(): AppState {
  const world = generateWorld(WORLD_SIZE);
  const worldCenterX = (WORLD_SIZE * TILE_SIZE) / 2;
  const worldCenterY = (WORLD_SIZE * TILE_SIZE) / 2;

  return {
    player: { x: worldCenterX, y: worldCenterY },
    world,
  };
}

export function App() {
  const [state, setState] = useImmer<AppState>(initializeAppState);

  useKeyboard({
    speed: PLAYER_SPEED,
    setState,
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
        transform={`translate(${window.innerWidth / 2 - state.player.x}, ${window.innerHeight / 2 - state.player.y})`}
      >
        <TileGrid world={state.world} tileSize={TILE_SIZE} />
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
