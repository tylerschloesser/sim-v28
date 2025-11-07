import type {
  Player,
  Viewport,
  ChunkBounds,
  UncoverAction,
  MineAction,
  BuildAction,
  Inventory,
  ItemType,
  Entity,
} from "./types";

interface DebugOverlayProps {
  player: Player;
  viewport: Viewport;
  visibleChunks: ChunkBounds;
  action: UncoverAction | MineAction | BuildAction | null;
  inventory: Inventory;
  selectedItem: ItemType | null;
  entities: Record<string, Entity>;
}

export function DebugOverlay({
  player,
  viewport,
  visibleChunks,
  action,
  inventory,
  selectedItem,
  entities,
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

      <div style={{ marginTop: "10px" }}>Action:</div>
      {action ? (
        <>
          <div>type: {action.type}</div>
          {action.type === "build" ? (
            <>
              <div>item: {action.itemType}</div>
              <div>valid: {action.valid ? "yes" : "no"}</div>
              <div>
                pos: ({action.targetX}, {action.targetY})
              </div>
            </>
          ) : (
            <>
              <div>tile: {action.tileId}</div>
              <div>progress: {(action.progress * 100).toFixed(1)}%</div>
            </>
          )}
        </>
      ) : (
        <div>none</div>
      )}

      <div style={{ marginTop: "10px" }}>Selected Item:</div>
      <div>{selectedItem || "none"}</div>

      <div style={{ marginTop: "10px" }}>Entities:</div>
      <div>count: {Object.keys(entities).length}</div>

      <div style={{ marginTop: "10px" }}>Inventory:</div>
      <div>stone: {inventory.stone}</div>
      <div>wood: {inventory.wood}</div>
      <div>iron: {inventory.iron}</div>
      <div>copper: {inventory.copper}</div>
      <div>coal: {inventory.coal}</div>
    </div>
  );
}
