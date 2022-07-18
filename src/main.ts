import "@/style.scss";
import { resizeCanvas } from "./canvas";

const canvas = <HTMLCanvasElement>document.querySelector("canvas");
if (!canvas) throw new Error("No canvas element.");

const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
if (!ctx) throw new Error("Could not get canvas context.");

// CONFIG VARIABLES
const SHOW_FPS = true;

let lastRenderTime = 0;
function render(time: number) {
  requestAnimationFrame(render);

  const dt = time - lastRenderTime;

  // pre-draw steps
  resizeCanvas(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw steps

  // post-draw steps
  if (SHOW_FPS) {
    const fps = Math.round(1000 / dt);
    const fontSize = 32;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";

    ctx.fillText(`${fps}`, 5, fontSize);

    ctx.font = "";
    ctx.fillStyle = "";
  }

  lastRenderTime = time;
}

requestAnimationFrame(render);
