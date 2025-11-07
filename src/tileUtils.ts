/**
 * Helper functions for converting between tile coordinates and string identifiers.
 *
 * Tile IDs are used to uniquely identify tiles in actions (UncoverAction, MineAction)
 * and follow the format: "x,y" where x and y are tile coordinates.
 */

/**
 * Converts tile x,y coordinates to a string identifier.
 * @param x - Tile X coordinate
 * @param y - Tile Y coordinate
 * @returns String in format "x,y"
 */
export function tileToId(x: number, y: number): string {
  return `${x},${y}`;
}

/**
 * Parses a tile ID string back to x,y coordinates.
 * @param tileId - String in format "x,y"
 * @returns Tuple of [x, y] coordinates
 */
export function idToTile(tileId: string): [number, number] {
  const [x, y] = tileId.split(",").map(Number);
  return [x, y];
}
