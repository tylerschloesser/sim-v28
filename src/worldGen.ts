import type { World, Tile } from "./types";

function randomColor(): string {
  const lightness = Math.floor(Math.random() * 100);
  return `hsl(0, 0%, ${lightness}%)`;
}

export function generateWorld(size: number): World {
  const world: World = [];

  for (let y = 0; y < size; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < size; x++) {
      row.push({ color: randomColor() });
    }
    world.push(row);
  }

  return world;
}
