import type { World, Tile } from "./types";

export function generateWorld(size: number): World {
  const world: World = [];
  const centerX = size / 2;
  const centerY = size / 2;
  const uncoverRadius = 4;

  for (let y = 0; y < size; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < size; x++) {
      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Tiles within radius are uncovered (false), rest are covered (true)
      const covered = distance > uncoverRadius;

      row.push({ covered });
    }
    world.push(row);
  }

  return world;
}
