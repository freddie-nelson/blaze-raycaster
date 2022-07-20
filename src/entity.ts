import { vec2 } from "gl-matrix";

export default class Entity {
  constructor(public pos = vec2.create(), public vel = vec2.create()) {}

  update(dt: number) {
    vec2.scaleAndAdd(this.pos, this.pos, this.vel, dt);
  }
}
