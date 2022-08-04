import { vec2 } from "gl-matrix";

/**
 * Describes a collision between two {@link Collider}s (A and B).
 *
 * @field `normal` vector `b - a` normalised
 * @field `depth` The length of the vector `b - a`
 * @field `hasCollision` Wether or not the A and B are colliding
 */
export interface CollisionResult {
  normal: vec2;
  depth: number;
  hasCollision: boolean;
}

/**
 * Represents a collider (bounding box) in 2D space.
 *
 * Collider's should always be positioned in world space so that collisions can be calculated correctly.
 */
export default abstract class Collider {
  /**
   * Checks if this collider is colliding with another collider.
   *
   * @param c {@link Collider} to test collisions against
   * @returns {@link CollisionResult} with the results of the test
   */
  abstract testCollision(c: Collider): CollisionResult;

  /**
   * Calculates a support point on the minkowski difference in a given direction.
   *
   * @param c The collider to test against
   * @param direction The direction to use when calculating furthest points
   * @returns The support point in the given direction for the [Minkowski difference](https://en.wikipedia.org/wiki/Minkowski_addition)
   */
  abstract supportPoint(c: Collider, direction: vec2): vec2;

  /**
   * Calculates the furthest point on the collider in a direction.
   *
   * @param direction The direction in which to calculate the furthest point
   * @returns The furthest point on the collider in the given direction
   */
  abstract findFurthestPoint(direction: vec2): vec2;

  /**
   * Calculates the furthest point on the collider in a direction and it's neighbouring vertices on the collider.
   *
   * @param direction The direction in which to calculate the furthest point
   * @returns The furthest point on the collider in the given direction and its left and right neighbours
   */
  abstract findFurthestNeighbours(direction: vec2): {
    left: vec2;
    furthest: vec2;
    right: vec2;
    leftIndex?: number;
    rightIndex?: number;
  };

  abstract getPosition(): vec2;
}
