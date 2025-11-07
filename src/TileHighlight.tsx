import { memo } from "react";
import type { UncoverAction, MineAction, BuildAction } from "./types";
import { TILE_SIZE } from "./constants";
import { idToTile } from "./tileUtils";

interface TileHighlightProps {
  action: UncoverAction | MineAction | BuildAction | null;
}

export const TileHighlight = memo(function TileHighlight({
  action,
}: TileHighlightProps) {
  // No action or build action = no highlight
  if (!action || action.type === "build") {
    return null;
  }

  // Derive color from action type
  const color = action.type === "mine" ? "yellow" : "blue";

  // Parse tile coordinates from tileId
  const [x, y] = idToTile(action.tileId);

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
