/**
 * Row / tile vocabulary for the map generator.
 * Decision checkpoints use the same underlying row `type` as in CrossyGameMap.
 */
export const ROW_GRASS = "grass" as const;
export const ROW_ROAD = "road" as const;
export const ROW_WATER = "water" as const;
/** Mission checkpoint — rendered as a highlighted lane row + full-screen decision flow */
export const QUESTION_TILE = "decision" as const;

export type RowKind =
  | typeof ROW_GRASS
  | typeof ROW_ROAD
  | typeof ROW_WATER
  | typeof QUESTION_TILE;

/** Accent for 3D checkpoint strip (gold, pulses toward amber in tick) */
export const CHECKPOINT_TILE_COLOR = 0xffd84d;
