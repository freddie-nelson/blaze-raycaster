import { z } from "zod";

export const mapSchema = z.object({
  size: z.number().min(1).int(),
  origin: z.array(z.number().int().nonnegative()).length(2),
  map: z.array(z.array(z.number().int().nonnegative()).min(1)).min(1),
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
