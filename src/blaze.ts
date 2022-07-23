import { glMatrix, vec2 } from "gl-matrix";
import Camera from "./camera";
import { resizeCanvas } from "./canvas";
import Controls from "./controls/controls";
import PointerLockControls from "./controls/pointerLock";
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
  readonly entities: Entity[] = [];
  private timeStep = new TimeStep(0, 0, 0);

  private renderScale = 0.5;
  private canvas: BlazeElement<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  private controls: Controls;

  constructor(
    canvas: HTMLCanvasElement,
    public map: GameMap,
    public player = new Player(),
    public camera = new Camera(glMatrix.toRadian(70), new Viewport(640, 480)),
  ) {
    this.canvas = new BlazeElement(canvas);
    this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    if (!this.ctx) throw new Error("Could not get canvas context");

    this.controls = new PointerLockControls(this.canvas.element, this.camera);
  }

  start() {
    this.timeStep = new TimeStep(performance.now(), 0, 0);

    this.update();
  }

  update() {
    requestAnimationFrame(() => this.update());
    this.timeStep = this.timeStep.next();

    this.player.update(this.timeStep);
    this.camera.update(this.timeStep);

    this.controls.update();

    // temp camera controls
    const move = vec2.create();
    const moveSpeed = 1 * this.timeStep.dt;

    if (this.canvas.keys.isPressed("KeyW")) move[1] += moveSpeed;
    if (this.canvas.keys.isPressed("KeyS")) move[1] -= moveSpeed;
    if (this.canvas.keys.isPressed("KeyA")) move[0] += moveSpeed;
    if (this.canvas.keys.isPressed("KeyD")) move[0] -= moveSpeed;

    vec2.normalize(move, move);
    vec2.scale(move, move, moveSpeed);
    this.camera.translate(move);

    for (const e of this.entities) {
      e.update(this.timeStep);
    }

    this.render();
  }

  private render() {
    // pre-draw steps
    resizeCanvas(this.canvas.element, this.renderScale);
    this.camera.viewport.resize(this.canvas.element.width, this.canvas.element.height);

    clear(this.ctx);

    // raycast map
    const viewport = this.camera.viewport;
    const incAngle = this.getIncrementAngle();
    const dir = vec2.create();

    for (let x = 0; x < viewport.width; x++) {
      const angle = incAngle * x - incAngle * viewport.getHalfWidth();
      vec2.rotate(dir, this.camera.dir, ORIGIN_2D, angle);

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
