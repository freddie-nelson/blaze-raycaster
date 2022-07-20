import { vec2 } from "gl-matrix";
import Camera from "./camera";
import Entity from "./entity";
import { ORIGIN_2D } from "./globals";
import { GameMap } from "./maps";
import Player from "./player";
import Ray from "./ray";
import Viewport from "./viewport";

export default class Raycaster {
  precision = 64;
  readonly entities: Entity[] = [];

  constructor(
    public ctx: CanvasRenderingContext2D,
    public map: GameMap,
    public player = new Player(),
    public camera = new Camera(60, new Viewport(640, 480)),
  ) {}

  update(dt: number) {
    this.player.update(dt);
    this.camera.update(dt);

    for (const e of this.entities) {
      e.update(dt);
    }
  }

  render(dt: number) {
    const incAngle = this.getIncrementAngle();

    for (let x = 0; x < this.camera.viewport.width; x++) {
      const angle = incAngle * x - incAngle * this.camera.viewport.getHalfWidth();
      const dir = vec2.rotate(vec2.create(), this.camera.direction, ORIGIN_2D, angle);

      const ray = new Ray(this.camera.pos, dir, this.map.size);
      const result = ray.cast(this.map);
      if (!result) continue;

      console.log(result);
    }
  }

  getIncrementAngle() {
    return this.camera.getFov() / this.camera.viewport.width;
  }
}
