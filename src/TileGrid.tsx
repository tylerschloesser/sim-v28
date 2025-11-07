import { memo } from "react";
import type { World } from "./types";

interface TileGridProps {
  world: World;
  tileSize: number;
}

export const TileGrid = memo(function TileGrid({
  world,
  tileSize,
}: TileGridProps) {
  return (
    <>
      {world.map((row, y) =>
        row.map((tile, x) => (
          <rect
            key={`${x}-${y}`}
            x={x * tileSize}
            y={y * tileSize}
            width={tileSize}
            height={tileSize}
            fill={tile.color}
          />
        )),
      )}
    </>
  );
});
