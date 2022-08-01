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
   * @param dir The direction the camera is facing (must be normalized unit vector)
   */
  constructor(private fov: number, public viewport = new Viewport(640, 480), dir?: vec2) {
    super(vec2.create(), dir, vec2.create());
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

  resize(width: number, height: number) {
    if (this.viewport.width === width && this.viewport.height === height) return;

    this.viewport.resize(width, height);
  }
}
