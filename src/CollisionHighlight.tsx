import { memo } from "react";
import { TILE_SIZE } from "./constants";

interface CollisionHighlightProps {
  collidingTiles: Set<string>;
}

export const CollisionHighlight = memo(function CollisionHighlight({
  collidingTiles,
}: CollisionHighlightProps) {
  return (
    <g>
      {Array.from(collidingTiles).map((tileKey) => {
        const [x, y] = tileKey.split(",").map(Number);
        return (
          <rect
            key={`collision-${tileKey}`}
            x={x * TILE_SIZE}
            y={y * TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill="none"
            stroke="red"
            strokeWidth={2}
          />
        );
      })}
    </g>
  );
});
