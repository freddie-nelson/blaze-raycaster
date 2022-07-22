import { vec2 } from "gl-matrix";
import { ORIGIN_2D } from "./globals";
import TimeStep from "./timestep";

export default class Entity {
  constructor(public pos = vec2.create(), public dir = vec2.create(), public vel = vec2.create()) {}

  update(timeStep: TimeStep) {
    vec2.scaleAndAdd(this.pos, this.pos, this.vel, timeStep.dt);
  }

  translate(x: number, y: number): void;
  translate(v: vec2): void;

  translate(x: number | vec2, y?: number) {
    let v: vec2;
    if (typeof x === "number" && typeof y === "number") {
      v = vec2.fromValues(x, y);
    } else if (typeof x !== "number") {
      v = x;
    } else {
      throw new Error("Invalid arguments");
    }

    const angle = Math.atan2(this.dir[1], this.dir[0]);
    vec2.rotate(v, v, ORIGIN_2D, angle - Math.PI / 2);
    vec2.add(this.pos, this.pos, v);
  }

  rotate(angle: number) {
    vec2.rotate(this.dir, this.dir, ORIGIN_2D, angle);
  }
}
