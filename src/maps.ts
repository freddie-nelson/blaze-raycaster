import { vec2 } from "gl-matrix";
import { z } from "zod";
import AABB from "./physics/aabb";

export const jsonMapSchema = z.object({
  size: z.number().min(1).int(),
  origin: z.array(z.number().int().nonnegative()).length(2),
  map: z.array(z.array(z.number().int().nonnegative()).min(1)).min(1),
  textures: z.array(z.string()),
});

export type JSONMap = z.infer<typeof jsonMapSchema>;

export interface GameMap {
  size: number;
  origin: vec2;
  map: number[][];
  textures: ImageData[];
  wallAABBs: AABB[];
}

/**
 * Loads a map from a json file in /maps/.
 *
 * @throws When map doesn't exist or map is invalid.
 *
 * @param name THe name of the map to load
 * @returns The parsed map
 */
export async function loadMap(name: string): Promise<GameMap> {
  const obj = await (await fetch(`/maps/${name}.json`)).json();
  const map = jsonMapSchema.parse(obj);

  // check to see if textures array contains correct amount of textures for map data
  let maxCell = 0;
  for (let y = 0; y < map.size; y++) {
    for (let x = 0; x < map.size; x++) {
      if (map.map[y][x] > maxCell) maxCell = map.map[y][x];
    }
  }

  if (maxCell !== map.textures.length)
    throw new Error("Textures array must contain same number of textures as maximum cell id used in map array.");

  // load textures
  const textures = await Promise.all(
    map.textures.map((t) => {
      return imageDataFromSource(`/textures/${t}`);
    }),
  );

  // create aabbs
  const wallAABBs: AABB[] = [];
  for (let y = 0; y < map.size; y++) {
    for (let x = 0; x < map.size; x++) {
      if (map.map[y][x] !== 0) {
        const wx = x - map.origin[0];
        const wy = y - map.origin[1];
        wallAABBs.push(new AABB(vec2.fromValues(wx, wy), vec2.fromValues(wx + 1, wy + 1)));
      }
    }
  }

  return {
    size: map.size,
    origin: <vec2>map.origin,
    map: map.map,
    textures,
    wallAABBs,
  };
}

const canvas = document.createElement("canvas");
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

async function imageDataFromSource(src: string) {
  const img = new Image();
  img.src = src;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject();
  });

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}
