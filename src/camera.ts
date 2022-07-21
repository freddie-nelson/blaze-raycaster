import { vec2 } from "gl-matrix";
import Entity from "./entity";
import { ORIGIN_2D } from "./globals";
import Viewport from "./viewport";

export default class Camera extends Entity {
  /**
   * Creates a new camera.
   *
   * @param fov The field of view in radians
   * @param viewport The camera's viewport
   * @param direction The direction the camera is facing (must be normalized unit vector)
   */
  constructor(
    private fov: number,
    public viewport = new Viewport(640, 480),
    readonly direction = vec2.fromValues(0, 1),
  ) {
    super(vec2.create(), vec2.create());
  }

  setFov(fov: number) {
    this.fov = fov;
  }

  getFov() {
    return this.fov;
  }

  getHalfFov() {
    return this.fov / 2;
  }

  /**
   * Rotates the camera.
   *
   * @param angle The angle to rotate by in radians
   */
  rotate(angle: number) {
    vec2.rotate(this.direction, this.direction, ORIGIN_2D, angle);
  }
}
