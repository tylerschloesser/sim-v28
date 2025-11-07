import { useImmer } from "use-immer";
import { generateWorld } from "./worldGen";
import { TileGrid } from "./TileGrid";
import { TileHighlight } from "./TileHighlight";
import { useKeyboard } from "./useKeyboard";
import { DebugOverlay } from "./DebugOverlay";
import { updateViewport, updateVisibleChunks } from "./viewportUtils";
import type { AppState } from "./types";
import { WORLD_SIZE, TILE_SIZE } from "./constants";

function initializeAppState(): AppState {
  const world = generateWorld(WORLD_SIZE);
  const worldCenterX = (WORLD_SIZE * TILE_SIZE) / 2;
  const worldCenterY = (WORLD_SIZE * TILE_SIZE) / 2;

  const state: AppState = {
    player: { x: worldCenterX, y: worldCenterY, vx: 0, vy: 0 },
    world,
    viewport: { x: 0, y: 0, width: 0, height: 0 },
    visibleChunks: { minChunkX: 0, maxChunkX: 0, minChunkY: 0, maxChunkY: 0 },
    action: null,
    inventory: {
      stone: 0,
      wood: 0,
      iron: 0,
      copper: 0,
      coal: 0,
    },
  };

  // Calculate initial viewport and chunks
  updateViewport(state);
  updateVisibleChunks(state);

  return state;
}

export function App() {
  const [state, setState] = useImmer<AppState>(initializeAppState);

  useKeyboard({ setState });

  // Calculate which tiles to highlight based on current action
  // Yellow for mining, blue for uncovering
  let highlightedTiles = new Set<string>();
  let highlightColor = "red"; // default
  if (state.action) {
    highlightedTiles = new Set([state.action.tileId]);
    highlightColor = state.action.type === "mine" ? "yellow" : "blue";
  }

  return (
    <>
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
          <TileGrid world={state.world} visibleChunks={state.visibleChunks} />
          <TileHighlight
            highlightedTiles={highlightedTiles}
            color={highlightColor}
          />
        </g>
        <circle
          cx={window.innerWidth / 2}
          cy={window.innerHeight / 2}
          r={4}
          fill="#0000ff"
        />
      </svg>
      <DebugOverlay
        player={state.player}
        viewport={state.viewport}
        visibleChunks={state.visibleChunks}
        action={state.action}
        inventory={state.inventory}
      />
    </>
  );
}
