import { vec2 } from "gl-matrix";
import Collider, { CollisionResult } from "./collider";
import EPA from "./epa";
import GJK from "./gjk";

export default class Circle implements Collider {
  constructor(public centre: vec2, public radius: number) {}

  /**
   * Checks if this box is colliding with another collider.
   *
   * @param c {@link Collider} to test collisions against
   * @returns {@link CollisionResult} with the results of the test
   */
  testCollision(c: Collider): CollisionResult {
    const res: CollisionResult = {
      normal: vec2.create(),
      depth: 0,
      hasCollision: false,
    };

    const gjkRes = GJK(this, c);
    if (!gjkRes.collision || !gjkRes.simplex) return res;

    res.hasCollision = true;
    const epaRes = EPA(gjkRes.simplex, this, c);
    if (!epaRes) return res;

    res.normal = epaRes.normal;
    res.depth = epaRes.depth;

    return res;
  }

  /**
   * Calculates a support point on the minkowski difference in a given direction.
   *
   * @param c The collider to test against
   * @param direction The direction to use when calculating furthest points
   * @returns The support point in the given direction for the [Minkowski difference](https://en.wikipedia.org/wiki/Minkowski_addition)
   */
  supportPoint(c: Collider, direction: vec2) {
    const p = vec2.create();
    const reverse = vec2.create();
    vec2.scale(reverse, direction, -1);

    vec2.sub(p, this.findFurthestPoint(direction), c.findFurthestPoint(reverse));
    return p;
  }

  /**
   * Calculates the furthest point on the collider in a direction.
   *
   * @param direction The direction in which to calculate the furthest point
   * @returns The furthest point on the collider in the given direction
   */
  findFurthestPoint(direction: vec2) {
    // get point on circumference of unit circle at origin in the given direction
    const p = vec2.clone(direction);
    vec2.normalize(p, p);

    // scale unit circle to size of this circle and move to circle's position
    vec2.scale(p, p, this.radius);
    vec2.add(p, p, this.centre);

    return p;
  }

  /**
   * Calculates the furthest point on the collider in a direction and it's neighbouring vertices on the collider.
   *
   * @param direction The direction in which to calculate the furthest point
   * @returns The furthest point on the collider in the given direction and its left and right neighbours
   */
  findFurthestNeighbours(direction: vec2) {
    const p = this.findFurthestPoint(direction);

    return {
      furthest: p,
      left: vec2.rotate(vec2.create(), p, this.centre, -Math.PI / 45),
      right: vec2.rotate(vec2.create(), p, this.centre, Math.PI / 45),
    };
  }

  getPosition() {
    return this.centre;
  }
}
