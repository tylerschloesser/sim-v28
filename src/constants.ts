import type { ResourceType } from "./types";

export const WORLD_SIZE = 128;
export const TILE_SIZE = 32;
export const CHUNK_SIZE = 16; // tiles per chunk (16x16)
export const PLAYER_SPEED = 10; // max speed in tiles per second
export const PLAYER_ACCELERATION = 100; // acceleration in tiles per second^2
export const COLLISION_PADDING = 2; // pixels from tile boundary

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  stone: "#808080", // gray
  wood: "#8B4513", // brown
  iron: "#C0C0C0", // silver
  copper: "#B87333", // copper
};
