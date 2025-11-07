export interface Tile {
  color: string;
}

export type World = Tile[][];

export interface Camera {
  x: number;
  y: number;
}
