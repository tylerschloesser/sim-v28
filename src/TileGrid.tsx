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

// Simple hash function for deterministic "random" based on x,y coordinates
function seededRandom(x: number, y: number): number {
  const seed = (x * 73856093) ^ (y * 19349663);
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function getTileColor(covered: boolean, x: number, y: number): string {
  const random = seededRandom(x, y);
  if (covered) {
    // Deterministic shade of black (0-20% lightness)
    const lightness = Math.floor(random * 20);
    return `hsl(0, 0%, ${lightness}%)`;
  } else {
    // Deterministic shade of white (80-100% lightness)
    const lightness = 80 + Math.floor(random * 20);
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
          fill={getTileColor(tile.covered, x, y)}
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
