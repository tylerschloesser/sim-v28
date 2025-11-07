export type ResourceType = "stone" | "wood" | "iron" | "copper" | "coal";

export type CraftedItemType = "stone-furnace" | "wood-storage";

export type ItemType = ResourceType | CraftedItemType;

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

export interface UncoverAction {
  type: "uncover";
  tileId: string;
  progress: number; // 0-1
}

export interface MineAction {
  type: "mine";
  tileId: string;
  progress: number; // 0-1, resets to remainder on completion
}

export interface Recipe {
  ingredients: Partial<Record<ItemType, number>>;
  craftTime: number; // milliseconds
  result: CraftedItemType;
}

export interface CraftQueueEntry {
  recipe: Recipe;
  progress: number; // 0-1
}

export type Inventory = Record<ItemType, number>;

export interface AppState {
  player: Player;
  world: World;
  viewport: Viewport;
  visibleChunks: ChunkBounds;
  action: UncoverAction | MineAction | null;
  inventory: Inventory;
  inventoryOpen: boolean;
  craftQueue: CraftQueueEntry[];
}

// Readonly types for pure functions
export type ReadonlyWorld = ReadonlyArray<ReadonlyArray<Readonly<Tile>>>;

export interface MovementInput {
  readonly currentX: number;
  readonly currentY: number;
  readonly dx: number;
  readonly dy: number;
  readonly world: ReadonlyWorld;
}

export interface MovementResult {
  readonly x: number;
  readonly y: number;
}
