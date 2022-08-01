import { vec2 } from "gl-matrix";
import { ORIGIN_2D } from "./globals";
import TimeStep from "./timestep";

export default class Entity {
  constructor(public pos = vec2.create(), public dir = vec2.fromValues(0, -1), public vel = vec2.create()) {}

  get angle() {
    return Math.atan2(this.dir[1], this.dir[0]) - Math.PI / 2;
  }

  update(timeStep: TimeStep) {
    vec2.scaleAndAdd(this.pos, this.pos, this.vel, timeStep.dt);
  }

  private translateVec = vec2.create();

  translate(x: number, y: number): void;
  translate(v: vec2): void;

  translate(x: number | vec2, y?: number) {
    if (typeof x === "number" && typeof y === "number") {
      vec2.set(this.translateVec, x, y);
    } else if (typeof x !== "number") {
      vec2.copy(this.translateVec, x);
    } else {
      throw new Error("Invalid arguments");
    }

    vec2.rotate(this.translateVec, this.translateVec, ORIGIN_2D, this.angle);
    vec2.add(this.pos, this.pos, this.translateVec);
  }

  rotate(angle: number) {
    vec2.rotate(this.dir, this.dir, ORIGIN_2D, angle);
  }

  // add(child: Entity) {
  //   child.parent = this;
  //   this.children.push(child);
  // }

  // remove(child: Entity) {
  //   const i = this.children.findIndex((c) => c === child);
  //   if (i !== -1) this.children.splice(i, 1);
  // }
}
