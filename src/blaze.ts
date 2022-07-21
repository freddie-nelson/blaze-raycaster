import { vec2 } from "gl-matrix";
import Camera from "./camera";
import { resizeCanvas } from "./canvas";
import { clear, line } from "./drawing";
import BlazeElement from "./element";
import Entity from "./entity";
import { ORIGIN_2D } from "./globals";
import { GameMap } from "./maps";
import Player from "./player";
import Ray from "./ray";
import TimeStep from "./timestep";
import Viewport from "./viewport";

export default class Blaze {
  precision = 64;
  readonly entities: Entity[] = [];
  private timeStep = new TimeStep(0, 0, 0);

  private canvas: BlazeElement<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  constructor(
    canvas: HTMLCanvasElement,
    public map: GameMap,
    public player = new Player(),
    public camera = new Camera(60, new Viewport(640, 480)),
  ) {
    this.canvas = new BlazeElement(canvas);
    this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    if (!this.ctx) throw new Error("Could not get canvas context");
  }

  start() {
    this.timeStep = new TimeStep(performance.now(), 0, 0);

    // temp camera controls
    this.canvas.keys.addListener("ArrowLeft", () => this.camera.rotate(-0.1));
    this.canvas.keys.addListener("ArrowRight", () => this.camera.rotate(0.1));

    this.update();
  }

  update() {
    requestAnimationFrame(() => this.update());
    this.timeStep = this.timeStep.next();

    this.player.update(this.timeStep);
    this.camera.update(this.timeStep);

    for (const e of this.entities) {
      e.update(this.timeStep);
    }

    this.render();
  }

  private render() {
    // pre-draw steps
    resizeCanvas(this.canvas.element);
    this.camera.viewport.resize(this.canvas.element.width, this.canvas.element.height);

    clear(this.ctx);

    // raycast map
    const viewport = this.camera.viewport;
    const incAngle = this.getIncrementAngle();
    const dir = vec2.create();

    for (let x = 0; x < viewport.width; x++) {
      const angle = incAngle * x - incAngle * viewport.getHalfWidth();
      vec2.rotate(dir, this.camera.direction, ORIGIN_2D, angle);

      const ray = new Ray(this.camera.pos, dir, this.map.size);
      const result = ray.cast(this.map);
      if (!result) continue;

      const height = Math.floor(viewport.getHalfHeight() / result.dist);
      line(this.ctx, x, viewport.getHalfHeight() - height, x, viewport.getHalfHeight() + height, "red");
    }

    // post-draw steps
    this.drawFPSText();
  }

  private drawFPSText() {
    const ctx = this.ctx;
    const fontSize = 32;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";

    ctx.fillText(`${this.timeStep.getFPS()}`, 5, fontSize);

    ctx.font = "";
    ctx.fillStyle = "";
  }

  getIncrementAngle() {
    return this.camera.getFov() / this.camera.viewport.width;
  }
}
