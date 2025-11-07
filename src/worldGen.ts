import type { World, Tile, ResourceType } from "./types";

export function generateWorld(size: number): World {
  const world: World = [];
  const centerX = size / 2;
  const centerY = size / 2;
  const uncoverRadius = 4;

  // Track which resources have been placed in uncovered area
  const resourcesPlaced = new Set<ResourceType>();
  const allResources: ResourceType[] = [
    "stone",
    "wood",
    "iron",
    "copper",
    "coal",
  ];

  for (let y = 0; y < size; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < size; x++) {
      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Tiles within radius are uncovered (false), rest are covered (true)
      const covered = distance > uncoverRadius;

      let resource: ResourceType | undefined = undefined;

      if (!covered) {
        // For uncovered tiles, ensure we place one of each resource type
        const unplacedResources = allResources.filter(
          (r) => !resourcesPlaced.has(r),
        );
        if (unplacedResources.length > 0 && Math.random() < 0.3) {
          // 30% chance to place a resource in uncovered area
          resource =
            unplacedResources[
              Math.floor(Math.random() * unplacedResources.length)
            ];
          resourcesPlaced.add(resource);
        }
      } else {
        // For covered tiles, 10% chance to have a random resource
        if (Math.random() < 0.1) {
          resource =
            allResources[Math.floor(Math.random() * allResources.length)];
        }
      }

      row.push({ covered, resource });
    }
    world.push(row);
  }

  // Ensure all resources are placed in uncovered area if they weren't during generation
  const uncoveredTiles: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= uncoverRadius && !world[y][x].resource) {
        uncoveredTiles.push({ x, y });
      }
    }
  }

  // Place any missing resources
  for (const resource of allResources) {
    if (!resourcesPlaced.has(resource) && uncoveredTiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * uncoveredTiles.length);
      const tile = uncoveredTiles[randomIndex];
      world[tile.y][tile.x].resource = resource;
      uncoveredTiles.splice(randomIndex, 1); // Remove used tile
      resourcesPlaced.add(resource);
    }
  }

  return world;
}
