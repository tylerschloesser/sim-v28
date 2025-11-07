export type ResourceType = "stone" | "wood" | "iron" | "copper";

export interface Tile {
  covered: boolean;
  resource?: ResourceType;
}

export type World = Tile[][];

export interface Player {
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
}

export interface Viewport {
  x: number; // top-left X in world coordinates
  y: number; // top-left Y in world coordinates
  width: number; // viewport width in pixels
  height: number; // viewport height in pixels
}

export interface ChunkBounds {
  minChunkX: number;
  maxChunkX: number;
  minChunkY: number;
  maxChunkY: number;
}

export interface MineAction {
  type: "mine";
  tileId: string;
  progress: number; // 0-1
}

export interface AppState {
  player: Player;
  world: World;
  collidingTiles: Set<string>;
  viewport: Viewport;
  visibleChunks: ChunkBounds;
  action: MineAction | null;
}
