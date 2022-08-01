import { glMatrix, vec2 } from "gl-matrix";
import Camera from "./camera";
import { resizeCanvas } from "./canvas";
import Controls from "./controls/controls";
import PointerLockControls from "./controls/pointerLock";
import { circle, clear, fillCircle, fillTriangle, line, strokeCircle } from "./drawing";
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

  private renderScale = 0.35;
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

    this.entities.push(player, camera);

    this.controls = new PointerLockControls(this.canvas.element, this.camera, this.player);
  }

  start() {
    this.timeStep = new TimeStep(performance.now(), 0, 0);

    this.update();
  }

  update() {
    requestAnimationFrame(() => this.update());
    this.timeStep = this.timeStep.next();
    this.controls.update();

    for (const e of this.entities) {
      e.update(this.timeStep);
    }

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
    this.player.translate(move);

    this.render();
  }

  private render() {
    // pre-draw steps
    resizeCanvas(this.canvas.element, this.renderScale);
    this.camera.resize(this.canvas.element.width, this.canvas.element.height);

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

      const distToScreenPlane = result.dist * Math.cos(angle);
      const height = Math.floor(viewport.getHalfHeight() / distToScreenPlane);
      line(this.ctx, x, viewport.getHalfHeight() - height, x, viewport.getHalfHeight() + height, "red");
    }

    // post-draw steps
    this.drawFPSText();
    this.drawDebugMap();
  }

  private drawFPSText() {
    const ctx = this.ctx;
    const fontSize = 32 * this.renderScale * 1.5;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";

    ctx.fillText(`${this.timeStep.getFPS()}`, 5, fontSize);

    ctx.font = "";
    ctx.fillStyle = "";
  }

  /**
   * Draws the debug minimap.
   *
   * @param zoom The amount of cells visible in the minimap
   * @param radius The radius of the minimap in pixels
   * @param margin The distance to draw the map from the top and right side of the screen (in pixels)
   */
  private drawDebugMap(
    zoom = Math.floor(this.map.size * 0.6),
    radius = this.camera.viewport.width * this.renderScale * 0.2,
    margin = radius * 0.1,
  ) {
    const ctx = this.ctx;
    const cx = this.camera.viewport.width - radius - margin;
    const cy = radius + margin;

    fillCircle(ctx, cx, cy, radius, "black");
    strokeCircle(ctx, cx, cy, radius, "#9e9e9e", 2);

    const mapImg = this.getMapImage(radius * 2 * (this.map.size / zoom));
    ctx.save();
    circle(ctx, cx, cy, radius - 1);
    ctx.clip();

    ctx.resetTransform();
    ctx.translate(cx, cy);
    ctx.rotate(mapImg.angle);
    ctx.drawImage(mapImg.img, -mapImg.px, -mapImg.py);

    ctx.resetTransform();
    ctx.restore();
  }

  private mapCanvas = document.createElement("canvas");
  private mapCtx = <CanvasRenderingContext2D>this.mapCanvas.getContext("2d");

  private getMapImage(size: number) {
    const cellSize = size / this.map.size;
    this.mapCanvas.width = size;
    this.mapCanvas.height = size;

    this.mapCtx.clearRect(0, 0, size, size);

    const px = (this.player.pos[0] + this.map.origin[0]) * cellSize;
    const py = (this.player.pos[1] + this.map.origin[1]) * cellSize;

    // draw player
    const pSize = cellSize * 0.6;
    this.mapCtx.translate(px, py);
    this.mapCtx.rotate(this.player.angle + Math.PI);
    fillTriangle(this.mapCtx, 0, 0, pSize, pSize, "blue");
    this.mapCtx.resetTransform();

    this.mapCtx.fillStyle = "white";
    this.mapCtx.fill();

    // draw cells
    for (let y = 0; y < this.map.size; y++) {
      for (let x = 0; x < this.map.size; x++) {
        if (this.map.map[y][x] !== 0) {
          this.mapCtx.fillStyle = "red";
          this.mapCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    const img = new Image();
    img.src = this.mapCanvas.toDataURL();
    return { img, px, py, angle: -this.player.angle + Math.PI };
  }

  getIncrementAngle() {
    return this.camera.getFov() / this.camera.viewport.width;
  }
}
