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

    // step direction
    const stepDirX = this.direction[0] < 0 ? -1 : 1;
    const stepDirY = this.direction[1] < 0 ? -1 : 1;

    // distance to step along the ray for 1 unit along corresponding axis
    let stepX = Math.sqrt(1 + (this.direction[1] / this.direction[0]) ** 2) * stepDirX;
    if (stepX === Infinity) stepX = 0;

    let stepY = Math.sqrt(1 + (this.direction[0] / this.direction[1]) ** 2) * stepDirY;
    if (stepY === Infinity) stepY = 0;

    // coordinates of cell containing ray origin
    const originCellWorld = this.getCellPos(this.origin);

    // x and y step to use on first dda iteration
    const startStepX = Math.abs(originCellWorld[0]) * stepX;
    const startStepY = Math.abs(originCellWorld[1]) * stepY;

    // track distance travelled using each axis step
    let travelledX = 0;
    let travelledY = 0;
    let dist = 0;
    let step = startStepX < startStepY ? startStepX : startStepY;
    let axis: 0 | 1 = startStepX < startStepY ? 0 : 1;
    const point = vec2.clone(this.origin);

    // console.log("stepDirX:", stepDirX, "stepDirY:", stepDirY, "stepX:", stepX, "stepY:", stepY);

    while (dist <= this.distance) {
      const cellIndex = this.getCellIndex(point, map);
      // console.log("cellX:", cellX, "cellY:", cellY);

      // check to see if ray is outside map
      if (cellIndex[0] < 0 || cellIndex[0] >= map.size || cellIndex[1] < 0 || cellIndex[1] >= map.size)
        return undefined;

      // check for cell collision
      const cell = grid[cellIndex[1]][cellIndex[0]];
      // console.log("cell:", cell);
      if (cell !== 0) {
        return {
          cell,
          cellIndex,
          hit: point,
          dist,
        };
      }

      // increment distances
      if (axis === 0) travelledX += step;
      else travelledY += step;
      dist += step;

      // console.log("axis:", axis, "step:", step, "dist:", dist, "travelledX:", travelledX, "travelledY:", travelledY);

      // move collision point along
      vec2.scaleAndAdd(point, point, this.direction, step);

      // choose new axis and step
      axis = travelledX < travelledY ? 0 : 1;
      if (axis === 0) step = stepX;
      else step = stepY;
    }

    return undefined;
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
