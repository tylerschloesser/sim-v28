import { memo } from "react";
import type { UncoverAction, MineAction } from "./types";
import { TILE_SIZE } from "./constants";

interface TileHighlightProps {
  action: UncoverAction | MineAction | null;
}

export const TileHighlight = memo(function TileHighlight({
  action,
}: TileHighlightProps) {
  // No action = no highlight
  if (!action) {
    return null;
  }

  // Derive color from action type
  const color = action.type === "mine" ? "yellow" : "blue";

  // Parse tile coordinates from tileId
  const [x, y] = action.tileId.split(",").map(Number);

  return (
    <rect
      x={x * TILE_SIZE}
      y={y * TILE_SIZE}
      width={TILE_SIZE}
      height={TILE_SIZE}
      fill="none"
      stroke={color}
      strokeWidth={2}
    />
  );
});
