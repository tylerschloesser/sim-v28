import { memo } from "react";
import type { World, ChunkBounds, ResourceType } from "./types";
import { TILE_SIZE, CHUNK_SIZE, RESOURCE_COLORS } from "./constants";
import { isCoveredTileAdjacentToUncovered } from "./playerMovement";

interface TileGridProps {
  tiles: World;
  visibleChunks: ChunkBounds;
}

interface TileChunkProps {
  tiles: World;
  chunkX: number; // chunk X index
  chunkY: number; // chunk Y index
}

// Simple hash function for deterministic "random" based on x,y coordinates
function seededRandom(x: number, y: number): number {
  const seed = (x * 73856093) ^ (y * 19349663);
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function getTileColor(
  covered: boolean,
  x: number,
  y: number,
  tiles: World,
): string {
  const random = seededRandom(x, y);
  if (covered) {
    // Check if this covered tile is adjacent to an uncovered tile
    const isAdjacent = isCoveredTileAdjacentToUncovered(x, y, tiles);
    if (isAdjacent) {
      // Covered and adjacent: medium gray (40-60% lightness)
      const lightness = 40 + Math.floor(random * 20);
      return `hsl(0, 0%, ${lightness}%)`;
    } else {
      // Covered and not adjacent: dark black (0-20% lightness)
      const lightness = Math.floor(random * 20);
      return `hsl(0, 0%, ${lightness}%)`;
    }
  } else {
    // Uncovered: white (80-100% lightness)
    const lightness = 80 + Math.floor(random * 20);
    return `hsl(0, 0%, ${lightness}%)`;
  }
}

// Creates a 4x4 checkerboard pattern for resource overlay
function createCheckerboardPattern(
  resource: ResourceType,
  tileX: number,
  tileY: number,
): React.JSX.Element[] {
  const squares = [];
  const squareSize = TILE_SIZE / 4; // 4x4 grid
  const color = RESOURCE_COLORS[resource];

  // Add transparent black background for contrast
  squares.push(
    <rect
      key={`resource-bg-${tileX}-${tileY}`}
      x={tileX * TILE_SIZE}
      y={tileY * TILE_SIZE}
      width={TILE_SIZE}
      height={TILE_SIZE}
      fill="rgba(0, 0, 0, 0.3)"
    />,
  );

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      // Checkerboard pattern: alternate squares
      if ((row + col) % 2 === 0) {
        squares.push(
          <rect
            key={`resource-${tileX}-${tileY}-${row}-${col}`}
            x={tileX * TILE_SIZE + col * squareSize}
            y={tileY * TILE_SIZE + row * squareSize}
            width={squareSize}
            height={squareSize}
            fill={color}
          />,
        );
      }
    }
  }

  return squares;
}

const TileChunk = memo(function TileChunk({
  tiles,
  chunkX,
  chunkY,
}: TileChunkProps) {
  const tileElements = [];
  const resourceOverlays = [];
  const startX = chunkX * CHUNK_SIZE;
  const startY = chunkY * CHUNK_SIZE;

  for (let dy = 0; dy < CHUNK_SIZE; dy++) {
    for (let dx = 0; dx < CHUNK_SIZE; dx++) {
      const x = startX + dx;
      const y = startY + dy;

      // Bounds check
      if (y >= tiles.length || x >= tiles[y].length) continue;

      const tile = tiles[y][x];
      tileElements.push(
        <rect
          key={`${x}-${y}`}
          x={x * TILE_SIZE}
          y={y * TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fill={getTileColor(tile.covered, x, y, tiles)}
        />,
      );

      // Add resource overlay for uncovered tiles with resources
      if (!tile.covered && tile.resource) {
        resourceOverlays.push(
          ...createCheckerboardPattern(tile.resource, x, y),
        );
      }
    }
  }

  return (
    <g data-chunk={`${chunkX},${chunkY}`}>
      {tileElements}
      {resourceOverlays}
    </g>
  );
});

export const TileGrid = memo(function TileGrid({
  tiles,
  visibleChunks,
}: TileGridProps) {
  const chunks = [];
  const { minChunkX, maxChunkX, minChunkY, maxChunkY } = visibleChunks;

  for (let chunkY = minChunkY; chunkY < maxChunkY; chunkY++) {
    for (let chunkX = minChunkX; chunkX < maxChunkX; chunkX++) {
      chunks.push(
        <TileChunk
          key={`chunk-${chunkX}-${chunkY}`}
          tiles={tiles}
          chunkX={chunkX}
          chunkY={chunkY}
        />,
      );
    }
  }

  return <>{chunks}</>;
});
