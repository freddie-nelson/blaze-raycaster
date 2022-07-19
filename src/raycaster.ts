import Camera from "./camera";
import Player from "./player";
import Viewport from "./viewport";

export default class Raycaster {
  precision = 64;

  constructor(
    public ctx: CanvasRenderingContext2D,
    public player = new Player(),
    public camera = new Camera(60, new Viewport(640, 480)),
  ) {}

  getIncrementAngle() {
    return this.camera.getFov() / this.camera.viewport.width;
  }
}
