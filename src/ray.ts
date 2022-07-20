import { vec2 } from "gl-matrix";
import { GameMap, mapSchema } from "./maps";

export interface MapCastResult {
  wall: number;
  dist: number;
}

export default class Ray {
  constructor(public origin: vec2, public direction: vec2, public distance: number) {}

  cast(map: GameMap): MapCastResult | undefined;

  cast(obj: GameMap) {
    if (mapSchema.strict().safeParse(obj).success) {
      return this.castMap(obj);
    }
  }

  private castMap(map: GameMap) {
    const grid = map.map;

    // step direction
    const stepDirX = this.direction[0] < 0 ? -1 : 1;
    const stepDirY = this.direction[1] < 0 ? -1 : 1;

    // distance to step along the ray for 1 unit along corresponding axis
    const stepX = Math.sqrt(1 + (this.direction[1] / this.direction[0]) ** 2) * stepDirX;
    const stepY = Math.sqrt(1 + (this.direction[0] / this.direction[1]) ** 2) * stepDirY;

    // coordinates of cell containing ray origin
    const [originCellX, originCellY] = this.getCellPos(this.origin, map);

    // x and y step to use on first dda iteration
    const startStepX = Math.abs(originCellX - this.origin[0]) * stepX;
    const startStepY = Math.abs(originCellY - this.origin[1]) * stepY;

    // track distance travelled using each axis step
    let travelledX = 0;
    let travelledY = 0;
    let dist = 0;
    let step = startStepX < startStepY ? startStepX : startStepY;
    let axis: 0 | 1 = startStepX < startStepY ? 0 : 1;
    const point = vec2.clone(this.origin);

    while (dist <= this.distance) {
      const [cellX, cellY] = this.getCellPos(point, map);

      // check to see if ray is outside map
      if (cellX < 0 || cellX === map.size || cellY < 0 || cellY === map.size) return;

      // check for cell collision
      const cell = grid[cellY][cellX];
      if (cell !== 0) {
        return {
          wall: cell,
          dist,
        };
      }

      // increment distances
      if (axis === 0) travelledX += step;
      else travelledY += step;
      dist += step;

      // move collision point along
      vec2.scaleAndAdd(point, point, this.direction, step);

      // choose new axis and step
      axis = travelledX < travelledY ? 0 : 1;
      if (axis === 0) step = stepX;
      else step = stepY;
    }
  }

  private getCellPos(point: vec2, map: GameMap) {
    const cellX = Math.floor(point[0]) - map.origin[0];
    const cellY = Math.floor(point[1]) - map.origin[1];
    return vec2.fromValues(cellX, cellY);
  }
}
