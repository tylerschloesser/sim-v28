import { memo } from "react";
import type { Entity, ChunkBounds } from "./types";
import {
  TILE_SIZE,
  CHUNK_SIZE,
  ITEM_COLORS,
  ENTITY_DEFINITIONS,
} from "./constants";

interface EntityRendererProps {
  entities: Record<string, Entity>;
  visibleChunks: ChunkBounds;
}

export const EntityRenderer = memo(function EntityRenderer({
  entities,
  visibleChunks,
}: EntityRendererProps) {
  const { minChunkX, maxChunkX, minChunkY, maxChunkY } = visibleChunks;

  // Calculate visible tile bounds
  const minTileX = minChunkX * CHUNK_SIZE;
  const maxTileX = maxChunkX * CHUNK_SIZE;
  const minTileY = minChunkY * CHUNK_SIZE;
  const maxTileY = maxChunkY * CHUNK_SIZE;

  const entityElements = [];

  for (const entity of Object.values(entities)) {
    const entityDef = ENTITY_DEFINITIONS[entity.type];
    const entityEndX = entity.x + entityDef.size.width;
    const entityEndY = entity.y + entityDef.size.height;

    // Check if entity is within visible bounds
    const isVisible =
      entityEndX > minTileX &&
      entity.x < maxTileX &&
      entityEndY > minTileY &&
      entity.y < maxTileY;

    if (!isVisible) continue;

    const color = ITEM_COLORS[entity.type];
    const pixelX = entity.x * TILE_SIZE;
    const pixelY = entity.y * TILE_SIZE;
    const pixelWidth = entityDef.size.width * TILE_SIZE;
    const pixelHeight = entityDef.size.height * TILE_SIZE;

    entityElements.push(
      <rect
        key={entity.id}
        x={pixelX}
        y={pixelY}
        width={pixelWidth}
        height={pixelHeight}
        fill={color}
        stroke="rgba(0, 0, 0, 0.3)"
        strokeWidth={2}
      />,
    );
  }

  return <>{entityElements}</>;
});
