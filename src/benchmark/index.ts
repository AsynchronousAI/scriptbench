import { Object, String } from "@rbxts/luau-polyfill";
import { Result } from "app/results";
import { Settings } from "settings";
import { FormattedBenchmarkScript } from "./types";
import { ComputeStats } from "./stats";
import { GraphData } from "app/graph/types";

const REQUIRED_PREFIX = ".bench";

export function GetBenchmarkName(module?: ModuleScript) {
  if (!module) return "";

  const required = require(module.Clone()) as FormattedBenchmarkScript<unknown>;
  if (required.Name) return required.Name;

  return module.Name.sub(1, module.Name.size() - REQUIRED_PREFIX.size());
}

export function ComputeResults(data: GraphData): Result[] {
  if (!data) return [];
  const prioritized = Settings.GetSetting("PrioritizedStat");

  return data.map((series) => {
    const times = Object.keys(series.data).map((k) => tonumber(k) as number);
    const stats = ComputeStats(times);

    return {
      Order: stats[prioritized as keyof typeof stats],
      Name: series.name,
      NumberData: Object.entries(stats) as Array<[string, number]>,
    };
  });
}

export function GetBenchmarkableModules() {
  const validModules: ModuleScript[] = [];

  for (const module of game.GetDescendants()) {
    if (!module.IsA("ModuleScript")) continue;
    if (!String.endsWith(module.Name, REQUIRED_PREFIX)) continue;

    try {
      const required = require(module) as FormattedBenchmarkScript<unknown>;
      if (!required.Functions)
        throw `Module ${module.Name} does not have Functions.`;
    } catch (e) {
      warn(`Module ${module.Name} failed to load:`, e);
      continue;
    }

    validModules.push(module);
  }

  return validModules;
}
