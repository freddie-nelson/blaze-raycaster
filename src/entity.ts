import { vec2 } from "gl-matrix";
import TimeStep from "./timestep";

export default class Entity {
  constructor(public pos = vec2.create(), public vel = vec2.create()) {}

  update(timeStep: TimeStep) {
    vec2.scaleAndAdd(this.pos, this.pos, this.vel, timeStep.dt);
  }
}
