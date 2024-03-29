import { vec2 } from "gl-matrix";
import Entity from "./entity";
import TimeStep from "./timestep";

export default class Player extends Entity {
  constructor(pos = vec2.create(), dir?: vec2, vel = vec2.create()) {
    super(pos, dir, vel, 0.2);
  }

  update(timeStep: TimeStep) {
    super.update(timeStep);

    // apply friction
    vec2.scale(this.vel, this.vel, 0.95);
  }
}
