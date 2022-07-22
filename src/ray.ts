import { vec2 } from "gl-matrix";
import { GameMap, mapSchema } from "./maps";

export interface MapCastResult {
  cell: number;
  cellIndex: vec2;
  hit: vec2;
  dist: number;
}

export default class Ray {
  /**
   * Creates a new ray.
   *
   * @param origin the origin of the ray in world space
   * @param direction The direction of the ray (normalized unit vector)
   * @param distance The maximum distance of the ray
   */
  constructor(public origin: vec2, public direction: vec2, public distance: number) {}

  cast(map: GameMap): MapCastResult | undefined;

  cast(obj: GameMap) {
    if (mapSchema.strict().safeParse(obj).success) {
      return this.castMap(obj);
    }

    return undefined;
  }

  private castMap(map: GameMap) {
    const grid = map.map;

    // distance to step along the ray for 1 unit along corresponding axis
    const rayUnitStepSize = vec2.fromValues(
      Math.sqrt(1 + (this.direction[1] / this.direction[0]) ** 2),
      Math.sqrt(1 + (this.direction[0] / this.direction[1]) ** 2),
    );

    const rayLength1D = vec2.create();

    // coordinates of cell containing the hit point
    const mapCheck = this.getCellPos(this.origin);

    // step direction
    const stepDir = vec2.create();

    if (this.direction[0] < 0) {
      stepDir[0] = -1;
      rayLength1D[0] = (this.origin[0] - mapCheck[0]) * rayUnitStepSize[0];
    } else {
      stepDir[0] = 1;
      rayLength1D[0] = (mapCheck[0] + 1 - this.origin[0]) * rayUnitStepSize[0];
    }

    if (this.direction[1] < 0) {
      stepDir[1] = -1;
      rayLength1D[1] = (this.origin[1] - mapCheck[1]) * rayUnitStepSize[1];
    } else {
      stepDir[1] = 1;
      rayLength1D[1] = (mapCheck[1] + 1 - this.origin[1]) * rayUnitStepSize[1];
    }

    let dist = 0;
    while (dist < this.distance) {
      // walk
      if (rayLength1D[0] < rayLength1D[1]) {
        mapCheck[0] += stepDir[0];
        dist = rayLength1D[0];
        rayLength1D[0] += rayUnitStepSize[0];
      } else {
        mapCheck[1] += stepDir[1];
        dist = rayLength1D[1];
        rayLength1D[1] += rayUnitStepSize[1];
      }

      // check to see if ray is outside map
      const cellIndex = this.getCellIndex(mapCheck, map);
      if (cellIndex[0] < 0 || cellIndex[0] >= map.size || cellIndex[1] < 0 || cellIndex[1] >= map.size) return;

      // check for wall collision
      const cell = grid[cellIndex[1]][cellIndex[0]];
      if (cell !== 0) {
        return {
          cell,
          cellIndex,
          hit: vec2.scaleAndAdd(vec2.create(), this.origin, this.direction, dist),
          dist,
        };
      }
    }

    return;
  }

  /**
   * Gets the cell position of a point.
   *
   * @param point a point in world space
   * @returns the cell position of the point in world space
   */
  private getCellPos(point: vec2) {
    const cellX = Math.floor(point[0]);
    const cellY = Math.floor(point[1]);
    return vec2.fromValues(cellX, cellY);
  }

  /**
   * Gets the cell index of a point in a map.
   *
   * @param point a point in world space
   * @param map The map to use
   * @returns The index of the cell containing the point
   */
  private getCellIndex(point: vec2, map: GameMap) {
    const cellX = Math.floor(point[0]) + map.origin[0];
    const cellY = Math.floor(point[1]) + map.origin[1];
    return vec2.fromValues(cellX, cellY);
  }
}
