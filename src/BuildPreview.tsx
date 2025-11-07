import { memo } from "react";
import type { BuildAction } from "./types";
import { TILE_SIZE, ENTITY_DEFINITIONS, ITEM_COLORS } from "./constants";

interface BuildPreviewProps {
  action: BuildAction;
}

export const BuildPreview = memo(function BuildPreview({
  action,
}: BuildPreviewProps) {
  const entityDef = ENTITY_DEFINITIONS[action.itemType];
  const color = ITEM_COLORS[action.itemType];

  const pixelX = action.targetX * TILE_SIZE;
  const pixelY = action.targetY * TILE_SIZE;
  const pixelWidth = entityDef.size.width * TILE_SIZE;
  const pixelHeight = entityDef.size.height * TILE_SIZE;

  // Use green for valid placement, red for invalid
  const overlayColor = action.valid
    ? "rgba(0, 255, 0, 0.3)"
    : "rgba(255, 0, 0, 0.3)";

  return (
    <>
      {/* Semi-transparent entity preview */}
      <rect
        x={pixelX}
        y={pixelY}
        width={pixelWidth}
        height={pixelHeight}
        fill={color}
        opacity={0.4}
        stroke="rgba(0, 0, 0, 0.3)"
        strokeWidth={2}
      />
      {/* Colored overlay for validity */}
      <rect
        x={pixelX}
        y={pixelY}
        width={pixelWidth}
        height={pixelHeight}
        fill={overlayColor}
        pointerEvents="none"
      />
    </>
  );
});
