import { z } from "zod";

const mapSchema = z.object({
  width: z.number().min(1),
  height: z.number().min(1),
  map: z.array(z.array(z.number()).min(1)).min(1),
});

export type GameMap = z.infer<typeof mapSchema>;

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
  return mapSchema.parse(obj);
}
