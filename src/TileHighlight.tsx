import { memo } from "react";
import { TILE_SIZE } from "./constants";

interface TileHighlightProps {
  highlightedTiles: Set<string>;
  color: string;
}

export const TileHighlight = memo(function TileHighlight({
  highlightedTiles,
  color,
}: TileHighlightProps) {
  return (
    <g>
      {Array.from(highlightedTiles).map((tileKey) => {
        const [x, y] = tileKey.split(",").map(Number);
        return (
          <rect
            key={`highlight-${tileKey}`}
            x={x * TILE_SIZE}
            y={y * TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        );
      })}
    </g>
  );
});
