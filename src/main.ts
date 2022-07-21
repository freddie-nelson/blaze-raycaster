import "@/style.scss";
import { loadMap } from "./maps";
import Blaze from "./blaze";

const canvas = <HTMLCanvasElement>document.querySelector("canvas");
if (!canvas) throw new Error("No canvas element.");

async function main() {
  // setup
  const map = await loadMap("test");
  const blz = new Blaze(canvas, map);
  blz.start();
}

main();
