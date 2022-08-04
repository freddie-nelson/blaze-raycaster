import { glMatrix, vec2 } from "gl-matrix";
import Camera from "./camera";
import { resizeCanvas } from "./canvas";
import Controls from "./controls/controls";
import PointerLockControls from "./controls/pointerLock";
import { circle, clear, fillCircle, fillTriangle, strokeCircle, texture } from "./drawing";
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

  private renderScale = 0.3;
  private canvas: BlazeElement<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  private buffer = document.createElement("canvas");
  private bufferCtx = <CanvasRenderingContext2D>this.buffer.getContext("2d");

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
    this.ctx.imageSmoothingEnabled = false;
    this.bufferCtx.imageSmoothingEnabled = false;

    this.update();
  }

  update() {
    requestAnimationFrame(() => this.update());
    this.timeStep = this.timeStep.next();
    this.controls.update();

    // temp player controls
    const move = vec2.create();
    const moveSpeed = 1 * this.timeStep.dt;

    if (this.canvas.keys.isPressed("KeyW")) move[1] += moveSpeed;
    if (this.canvas.keys.isPressed("KeyS")) move[1] -= moveSpeed;
    if (this.canvas.keys.isPressed("KeyA")) move[0] += moveSpeed;
    if (this.canvas.keys.isPressed("KeyD")) move[0] -= moveSpeed;

    vec2.normalize(move, move);
    vec2.scale(move, move, moveSpeed);
    this.player.translate(move);
    this.camera.pos = this.player.pos;

    for (const e of this.entities) {
      e.update(this.timeStep);
    }

    for (const e of this.entities) {
      if (e.noClip) continue;

      for (const w of this.map.wallAABBs) {
        const res = e.collider.testCollision(w);

        if (res.hasCollision) {
          const penetration = vec2.scale(vec2.create(), res.normal, res.depth);
          e.translate(penetration);
        }
      }
    }

    this.render();
  }

  private render() {
    // pre-draw steps
    resizeCanvas(this.canvas.element, this.renderScale);
    this.camera.resize(this.canvas.element.width, this.canvas.element.height);

    const viewport = this.camera.viewport;
    this.buffer.width = viewport.width;
    this.buffer.height = viewport.height;

    clear(this.ctx);

    // raycast map
    const incAngle = this.getIncrementAngle();
    const dir = vec2.create();
    const imageData = this.bufferCtx.createImageData(viewport.width, viewport.height);

    for (let x = 0; x < viewport.width; x++) {
      const angle = incAngle * x - incAngle * viewport.getHalfWidth();
      vec2.rotate(dir, this.camera.dir, ORIGIN_2D, angle);

      const ray = new Ray(this.camera.pos, dir, this.map.size * 2);
      const result = ray.cast(this.map);
      if (!result) continue;

      const distToScreenPlane = result.dist * Math.cos(angle);
      const height = Math.floor(viewport.getHalfHeight() / distToScreenPlane);

      const tex = this.map.textures[result.cell - 1];
      texture(
        imageData,
        x,
        viewport.getHalfHeight() - height,
        viewport.getHalfHeight() + height,
        tex,
        result.wallX * tex.width,
        result.wallAxis === 1 ? 0.9 : 1,
      );
    }

    // console.log(buffer.data);
    this.bufferCtx.putImageData(imageData, 0, 0);
    this.ctx.drawImage(this.buffer, 0, 0);

    // post-draw steps
    this.drawFPSText();
    this.drawMiniMap();
  }

  private drawFPSText() {
    const ctx = this.ctx;
    const fontSize = 32 * this.renderScale * 1.5;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";

    ctx.fillText(`${this.timeStep.getFPS()}`, fontSize * 0.15, fontSize * 0.9);

    ctx.font = "";
    ctx.fillStyle = "";
  }

  /**
   * Draws the minimap.
   *
   * @param zoom The amount of cells visible in the minimap
   * @param radius The radius of the minimap in pixels
   * @param margin The distance to draw the map from the top and right side of the screen (in pixels)
   */
  private drawMiniMap(zoom = Math.floor(this.map.size * 0.6), radius = 130 * this.renderScale, margin = radius * 0.1) {
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

    clear(this.mapCtx);

    const px = (this.player.pos[0] + this.map.origin[0]) * cellSize;
    const py = (this.player.pos[1] + this.map.origin[1]) * cellSize;

    // draw player
    this.mapCtx.translate(px, py);
    this.mapCtx.rotate(this.player.angle + Math.PI);
    fillCircle(this.mapCtx, 0, 0, this.player.collider.radius * cellSize, "white");
    this.mapCtx.resetTransform();

    // draw cells
    for (let y = 0; y < this.map.size; y++) {
      for (let x = 0; x < this.map.size; x++) {
        const cell = this.map.map[y][x];
        if (cell !== 0) {
          const tex = this.map.textures[cell - 1];
          this.mapCtx.putImageData(tex, x * cellSize, y * cellSize, 0, 0, cellSize, cellSize);
        }
      }
    }

    return { img: this.mapCanvas, px, py, angle: -this.player.angle + Math.PI };
  }

  getIncrementAngle() {
    return this.camera.getFov() / this.camera.viewport.width;
  }
}
