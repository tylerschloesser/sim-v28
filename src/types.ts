export interface Tile {
  color: string;
}

export type World = Tile[][];

export interface Player {
  x: number;
  y: number;
}
