import { Object, String } from "@rbxts/luau-polyfill";
import { Result } from "app/results";
import { Settings } from "settings";
import { FormattedBenchmarkScript, ProfileLog } from "./types";
import { ComputeStats } from "./stats";
import { GraphData } from "app/graph/types";

/* Constants */
const REQUIRED_PREFIX = ".bench";

export function GetBenchmarkName(module?: ModuleScript) {
  if (!module) return "";

  const required = require(module.Clone()) as FormattedBenchmarkScript<unknown>;
  if (required.Name) return required.Name;

  return module.Name.sub(1, module.Name.size() - REQUIRED_PREFIX.size());
}
export function ComputeResults(data: GraphData): Result[] {
  if (!data) return [];

  let results: Result[] = [];

  for (const [index, values] of pairs(data)) {
    const stats = ComputeStats(Object.keys(values.data));
    results.push({
      Order:
        stats[Settings.GetSetting("PrioritizedStat") as keyof typeof stats],
      Name: values.name,
      NumberData: Object.entries(stats).map(([key, value]) => [key, value]),
    });
  }
  return results;
}
export function GetBenchmarkableModules() {
  let validModules = [];
  for (const module of game.GetDescendants()) {
    if (!module.IsA("ModuleScript")) continue;
    if (!String.endsWith(module.Name, REQUIRED_PREFIX))
      continue; /* does not match required suffix */

    try {
      const required = require(module) as FormattedBenchmarkScript<unknown>;
      if (!required.Functions)
        throw `Module ${module.Name} does not have Functions.`;
    } catch (e) {
      warn(`Module ${module.Name} failed to load:`, e);
      continue; /* not a valid module */
    }

    validModules.push(module);
  }

  return validModules;
}
