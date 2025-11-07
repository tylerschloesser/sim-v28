import type {
  Player,
  Viewport,
  ChunkBounds,
  UncoverAction,
  MineAction,
  Inventory,
} from "./types";

interface DebugOverlayProps {
  player: Player;
  collidingTiles: Set<string>;
  viewport: Viewport;
  visibleChunks: ChunkBounds;
  action: UncoverAction | MineAction | null;
  inventory: Inventory;
}

export function DebugOverlay({
  player,
  collidingTiles,
  viewport,
  visibleChunks,
  action,
  inventory,
}: DebugOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 10,
        padding: "10px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "#00ff00",
        fontFamily: "monospace",
        fontSize: "12px",
        borderRadius: "4px",
        pointerEvents: "none",
      }}
    >
      <div>Player Position:</div>
      <div>x: {player.x.toFixed(2)}</div>
      <div>y: {player.y.toFixed(2)}</div>

      <div style={{ marginTop: "10px" }}>Viewport:</div>
      <div>x: {viewport.x.toFixed(2)}</div>
      <div>y: {viewport.y.toFixed(2)}</div>
      <div>w: {viewport.width}</div>
      <div>h: {viewport.height}</div>

      <div style={{ marginTop: "10px" }}>Visible Chunks:</div>
      <div>
        x: [{visibleChunks.minChunkX}, {visibleChunks.maxChunkX})
      </div>
      <div>
        y: [{visibleChunks.minChunkY}, {visibleChunks.maxChunkY})
      </div>
      <div>
        count:{" "}
        {(visibleChunks.maxChunkX - visibleChunks.minChunkX) *
          (visibleChunks.maxChunkY - visibleChunks.minChunkY)}
      </div>

      <div style={{ marginTop: "10px" }}>
        Colliding Tiles: {collidingTiles.size}
      </div>
      {collidingTiles.size > 0 && (
        <div style={{ marginTop: "5px", maxHeight: "100px", overflow: "auto" }}>
          {Array.from(collidingTiles).map((tile) => (
            <div key={tile} style={{ fontSize: "10px" }}>
              {tile}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "10px" }}>Action:</div>
      {action ? (
        <>
          <div>type: {action.type}</div>
          <div>tile: {action.tileId}</div>
          <div>progress: {(action.progress * 100).toFixed(1)}%</div>
        </>
      ) : (
        <div>none</div>
      )}

      <div style={{ marginTop: "10px" }}>Inventory:</div>
      <div>stone: {inventory.stone}</div>
      <div>wood: {inventory.wood}</div>
      <div>iron: {inventory.iron}</div>
      <div>copper: {inventory.copper}</div>
      <div>coal: {inventory.coal}</div>
    </div>
  );
}
