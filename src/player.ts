import { vec2 } from "gl-matrix";
import Entity from "./entity";

export default class Player extends Entity {
  constructor(pos = vec2.create(), vel = vec2.create()) {
    super(pos, vel);
  }

  update(dt: number) {
    super.update(dt);

    // apply friction
    vec2.scale(this.vel, this.vel, 0.95);
  }
}
