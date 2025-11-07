import { memo } from "react";
import type { AppState } from "./types";
import { TILE_SIZE, ENTITY_DEFINITIONS } from "./constants";
import { idToTile } from "./tileUtils";

interface TileHighlightProps {
  state: AppState;
}

export const TileHighlight = memo(function TileHighlight({
  state,
}: TileHighlightProps) {
  const { action } = state;

  // No action or build action = no highlight
  if (!action || action.type === "build") {
    return null;
  }

  // Handle destroy-entity action: highlight entire entity as one rectangle
  if (action.type === "destroy-entity") {
    const entity = state.entities[action.entityId];
    if (!entity) return null;

    // Get entity definition to determine size
    const entityDef = ENTITY_DEFINITIONS[entity.type];
    const width = entityDef.size.width * TILE_SIZE;
    const height = entityDef.size.height * TILE_SIZE;

    return (
      <rect
        x={entity.x * TILE_SIZE}
        y={entity.y * TILE_SIZE}
        width={width}
        height={height}
        fill="none"
        stroke="red"
        strokeWidth={2}
      />
    );
  }

  // Handle uncover and mine actions: highlight single tile
  const color = action.type === "mine" ? "yellow" : "blue";
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
