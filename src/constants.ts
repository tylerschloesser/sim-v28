import type { ResourceType } from "./types";

export const WORLD_SIZE = 128;
export const TILE_SIZE = 32;
export const CHUNK_SIZE = 16; // tiles per chunk (16x16)
export const PLAYER_SPEED = 10; // max speed in tiles per second
export const PLAYER_ACCELERATION = 100; // acceleration in tiles per second^2
export const COLLISION_PADDING = 2; // pixels from tile boundary
export const MINE_TIME_MS = 1000; // 1 second per mining cycle

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  iron: "hsl(180, 70%, 80%)", // cyan
  copper: "hsl(330, 70%, 80%)", // pink
  stone: "hsl(120, 70%, 80%)", // green
  coal: "hsl(270, 70%, 80%)", // purple
  wood: "hsl(30, 70%, 80%)", // orange
};
