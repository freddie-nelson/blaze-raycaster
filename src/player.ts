import { vec2 } from "gl-matrix";

export default class Player {
  constructor(public pos = vec2.create()) {}
}
