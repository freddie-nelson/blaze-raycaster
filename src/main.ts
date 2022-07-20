import "@/style.scss";
import { resizeCanvas } from "./canvas";
import { loadMap } from "./maps";
import Player from "./player";
import Raycaster from "./raycaster";

const canvas = <HTMLCanvasElement>document.querySelector("canvas");
if (!canvas) throw new Error("No canvas element.");

const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
if (!ctx) throw new Error("Could not get canvas context.");

// VARIABLES
const SHOW_FPS = true;

async function main() {
  // setup
  const map = await loadMap("test");
  const raycaster = new Raycaster(ctx, map);

  // create render function
  let lastRenderTime = 0;
  const render = (time: number) => {
    requestAnimationFrame(render);

    const dt = time - lastRenderTime;

    // pre-draw steps
    resizeCanvas(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw steps
    raycaster.update(dt);
    raycaster.render(dt);

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
  };

  // start render
  requestAnimationFrame(render);
}

main();
