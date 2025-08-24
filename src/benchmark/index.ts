import { Object, String } from "@rbxts/luau-polyfill";
import { Result } from "app/results";
import { GraphData } from "app/graph";
import { GetKeyColor } from "app/graph/computation";
import { Settings } from "settings";
import {
  BenchmarkResults,
  FormattedBenchmarkScript,
  ProfileLog,
} from "./types";
import { ComputeStats } from "./stats";
import { ToMicroseconds } from "./profiler";
import { BenchmarkLibrary } from "./lib";

/* Constants */
const REQUIRED_PREFIX = ".bench";
const clock = os.clock;

export function FilterMap(data: GraphData, threshold: number): GraphData {
  const result: GraphData = {};

  for (const [key, inner] of Object.entries(data)) {
    const filtered: { [key: number]: number } = {};
    for (const [numKey, value] of Object.entries(inner)) {
      const numericKey = tonumber(numKey)!;
      if (value > threshold) {
        filtered[numericKey] = value;
      }
    }
    if (Object.keys(filtered).size() > 0) {
      result[key] = filtered;
    }
  }

  return result;
}

function Benchmark(
  requiredModule: FormattedBenchmarkScript<unknown>,
  use: string,
  calls: number,

  setCount: (count: number) => void,
): [Map<number, number>, ProfileLog[]] {
  /* benchmark a single case in a module */
  let recordedTimes = new Map<number, number>(); /* time taken to calls map */
  const batching = Settings.GetSetting("Batching");

  table.clear(BenchmarkLibrary.ProfileLog);
  for (let count = 0; count <= calls; count++) {
    let parameter: unknown[] = [];

    /* this is extremely weird hacking of the typescript compiler so we can absorb lua tuples */
    if (requiredModule.Parameter) parameter = [requiredModule.Parameter()];
    else if (requiredModule.ParameterGenerator)
      /* compatible with Benchmarker plugin */
      parameter = [requiredModule.ParameterGenerator()];

    /* benchmark! */
    BenchmarkLibrary.ProfileLog.push([]); /* start on a new entry */

    const usingFunction = requiredModule.Functions![use];

    requiredModule.BeforeEach?.();
    const start = clock();
    usingFunction(BenchmarkLibrary, ...(parameter as [unknown]));
    const end_ = clock();
    requiredModule.AfterEach?.();

    const elapsedTime = ToMicroseconds(end_ - start);

    /* record */
    const current = recordedTimes.get(elapsedTime) ?? 0;
    recordedTimes.set(elapsedTime, current + 1);

    if (count % batching === 0) task.wait();
    setCount(count);
  }

  return [recordedTimes, table.clone(BenchmarkLibrary.ProfileLog)];
}
export function GetBenchmarkName(module?: ModuleScript) {
  if (!module) return "";

  const required = require(module.Clone()) as FormattedBenchmarkScript<unknown>;
  if (required.Name) return required.Name;

  return module.Name.sub(1, module.Name.size() - REQUIRED_PREFIX.size());
}
export function ComputeResults(data: GraphData): Result[] {
  if (!data) return [];

  let results: Result[] = [];

  for (const [name] of pairs(data)) {
    const stats = ComputeStats(Object.keys(data[name]));
    results.push({
      Order:
        stats[Settings.GetSetting("PrioritizedStat") as keyof typeof stats],
      Name: name as string,
      Color: GetKeyColor(name as string)[0],
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
export default function BenchmarkAll(
  module: ModuleScript,
  calls: number,
  setCount?: (count: number, status: string) => void,
  onError?: (error: string) => void,
): [BenchmarkResults, Map<string, ProfileLog[]>] | [] {
  /* benchmark all cases of a module */
  const totalResults = new Map<string, Map<number, number>>();
  const totalProfileLogs = new Map<string, ProfileLog[]>();

  const requiredModule = require(
    module.Clone(),
  ) as FormattedBenchmarkScript<unknown>;

  // First, run all benchmarks and store the results
  xpcall(
    () => {
      const functions = Object.keys(requiredModule.Functions!);

      let index = 0;

      requiredModule.BeforeAll?.();

      for (const benchmarkName of functions) {
        const [results, profileLog] = Benchmark(
          requiredModule,
          benchmarkName as string,
          calls,
          (v) => {
            setCount?.(
              (index * calls + v) / functions.size(),
              `${benchmarkName} (${v})`,
            );
          },
        );

        totalResults.set(benchmarkName as string, results);
        totalProfileLogs.set(benchmarkName as string, profileLog);

        index++;
      }

      requiredModule.AfterAll?.();
    },
    (errorMessage) => onError?.(errorMessage as string),
  );

  /* Post processing */
  /** Do all tests contain good amount of items? */
  for (const [name, results] of totalResults) {
    if (results.size() < 5) {
      onError?.(
        `Benchmark '${name}' was not able to return satisfactory results`,
      );
      return [];
    }
  }

  /** Make sure all data has matching indexs, and if one does not have data make it 0 */
  let minimumX = math.huge;
  for (const [name, results] of totalResults) {
    for (const [x, y] of results) {
      minimumX = math.min(minimumX, x);
    }
  }

  for (const [name, results] of totalResults) {
    for (let i = minimumX; i <= math.max(...Object.keys(results)); i++) {
      if (!results.has(i)) results.set(i, 0);
    }
  }

  return [totalResults, totalProfileLogs];
}
