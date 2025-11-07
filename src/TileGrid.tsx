import { memo } from "react";
import type { World } from "./types";
import { TILE_SIZE } from "./constants";

interface TileGridProps {
  world: World;
}

function getTileColor(covered: boolean): string {
  if (covered) {
    // Random shade of black (0-40% lightness)
    const lightness = Math.floor(Math.random() * 40);
    return `hsl(0, 0%, ${lightness}%)`;
  } else {
    // Random shade of white (60-100% lightness)
    const lightness = 60 + Math.floor(Math.random() * 40);
    return `hsl(0, 0%, ${lightness}%)`;
  }
}

export const TileGrid = memo(function TileGrid({ world }: TileGridProps) {
  return (
    <>
      {world.map((row, y) =>
        row.map((tile, x) => (
          <rect
            key={`${x}-${y}`}
            x={x * TILE_SIZE}
            y={y * TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill={getTileColor(tile.covered)}
          />
        )),
      )}
    </>
  );
});
