import type { Entity } from "./types";
import { ENTITY_DEFINITIONS } from "./constants";

/**
 * Get all tile coordinates that an entity occupies
 * @param entity The entity to get tiles for
 * @returns Array of {x, y} coordinates for all tiles the entity occupies
 */
export function getEntityTiles(entity: Entity): { x: number; y: number }[] {
  const definition = ENTITY_DEFINITIONS[entity.type];
  const tiles: { x: number; y: number }[] = [];

  for (let dy = 0; dy < definition.size.height; dy++) {
    for (let dx = 0; dx < definition.size.width; dx++) {
      tiles.push({
        x: entity.x + dx,
        y: entity.y + dy,
      });
    }
  }

  return tiles;
}
