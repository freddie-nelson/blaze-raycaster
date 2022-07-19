import { vec2 } from "gl-matrix";
import { ORIGIN_2D } from "./globals";
import Viewport from "./viewport";

export default class Camera {
  constructor(private fov: number, public viewport = new Viewport(640, 480), readonly direction = vec2.create()) {}

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
