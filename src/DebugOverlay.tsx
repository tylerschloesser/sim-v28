import type { Player } from "./types";

interface DebugOverlayProps {
  player: Player;
  collidingTiles: Set<string>;
}

export function DebugOverlay({ player, collidingTiles }: DebugOverlayProps) {
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
      <div style={{ marginTop: "10px" }}>
        Colliding Tiles: {collidingTiles.size}
      </div>
      {collidingTiles.size > 0 && (
        <div style={{ marginTop: "5px", maxHeight: "200px", overflow: "auto" }}>
          {Array.from(collidingTiles).map((tile) => (
            <div key={tile} style={{ fontSize: "10px" }}>
              {tile}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
