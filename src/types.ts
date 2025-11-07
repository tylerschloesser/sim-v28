export interface Tile {
  covered: boolean;
}

export type World = Tile[][];

export interface Player {
  x: number;
  y: number;
}
