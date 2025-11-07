import { memo } from "react";
import type { World, ChunkBounds } from "./types";
import { TILE_SIZE, CHUNK_SIZE } from "./constants";

interface TileGridProps {
  world: World;
  visibleChunks: ChunkBounds;
}

interface TileChunkProps {
  world: World;
  chunkX: number; // chunk X index
  chunkY: number; // chunk Y index
}

function getTileColor(covered: boolean): string {
  if (covered) {
    // Random shade of black (0-20% lightness)
    const lightness = Math.floor(Math.random() * 20);
    return `hsl(0, 0%, ${lightness}%)`;
  } else {
    // Random shade of white (80-100% lightness)
    const lightness = 80 + Math.floor(Math.random() * 20);
    return `hsl(0, 0%, ${lightness}%)`;
  }
}

const TileChunk = memo(function TileChunk({
  world,
  chunkX,
  chunkY,
}: TileChunkProps) {
  const tiles = [];
  const startX = chunkX * CHUNK_SIZE;
  const startY = chunkY * CHUNK_SIZE;

  for (let dy = 0; dy < CHUNK_SIZE; dy++) {
    for (let dx = 0; dx < CHUNK_SIZE; dx++) {
      const x = startX + dx;
      const y = startY + dy;

      // Bounds check
      if (y >= world.length || x >= world[y].length) continue;

      const tile = world[y][x];
      tiles.push(
        <rect
          key={`${x}-${y}`}
          x={x * TILE_SIZE}
          y={y * TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fill={getTileColor(tile.covered)}
        />,
      );
    }
  }

  return <g data-chunk={`${chunkX},${chunkY}`}>{tiles}</g>;
});

export const TileGrid = memo(function TileGrid({
  world,
  visibleChunks,
}: TileGridProps) {
  const chunks = [];
  const { minChunkX, maxChunkX, minChunkY, maxChunkY } = visibleChunks;

  for (let chunkY = minChunkY; chunkY < maxChunkY; chunkY++) {
    for (let chunkX = minChunkX; chunkX < maxChunkX; chunkX++) {
      chunks.push(
        <TileChunk
          key={`chunk-${chunkX}-${chunkY}`}
          world={world}
          chunkX={chunkX}
          chunkY={chunkY}
        />,
      );
    }
  }

  return <>{chunks}</>;
});
