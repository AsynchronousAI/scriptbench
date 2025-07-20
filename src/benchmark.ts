import { Error, Object, String } from "@rbxts/luau-polyfill";
import { MicroProfilerData } from "app/microprofiler";
import { Result } from "app/results";
import { GraphData } from "app/graph";
import { GetKeyColor } from "app/graph/computation";
import { Settings } from "settings";

/* Constants */
const REQUIRED_PREFIX = ".bench";

/* Types */
export type BenchmarkResults = Map<string, Map<number, number>>;
interface FormattedBenchmarkScript<T> {
  Parameter: () => T;
  Functions: { [name: string]: (lib: typeof BenchmarkLibrary, arg: T) => void };
  Name: string;

  /* Before + After functions */
  BeforeAll?: () => void;
  BeforeEach?: () => void;
  AfterEach?: () => void;
  AfterAll?: () => void;
}
export type ProfileLog = {
  time: number;
  name: string | false;
}[]; /* false represents end */
export interface Stats<T> {
  Avg: T;
  "50%": T;
  "90%": T;
  "10%": T;
  Min: T;
  Max: T;
  StdDev: T;
  Mode: T;
  MAD: T;
}

/* Library which is provided to the benchmark functions */
let globalProfileLog: ProfileLog[] = [];
const addNewProfileLogEntry = (name: string | false) => {
  const time = os.clock();
  const latestEntry = globalProfileLog[globalProfileLog.size() - 1];

  if (!latestEntry) {
    globalProfileLog.push([
      {
        time,
        name,
      },
    ]);
  } else {
    latestEntry.push({
      time,
      name,
    });
  }
};

const BenchmarkLibrary = {
  profilebegin: (name: string) => addNewProfileLogEntry(name),
  profileend: () => addNewProfileLogEntry(false),
};

/* Utility functions */
function getPercentileAverage(
  sortedKeys: number[],
  startPercent: number,
  endPercent: number,
): number {
  const size = sortedKeys.size();
  const startIndex = math.floor(size * startPercent);
  const endIndex = math.floor(size * endPercent);

  let sum = 0;
  let count = 0;
  for (let i = startIndex; i < endIndex && i < size; i++) {
    sum += sortedKeys[i];
    count += 1;
  }
  return count > 0 ? sum / count : 0;
}

function ComputeStats(data: number[]): Stats<number> {
  if (data.size() === 0) {
    throw new Error("Data array must not be empty.");
  }

  const sorted = [...data].sort();
  const size = sorted.size();

  const average = sorted.reduce((sum, value) => sum + value, 0) / size;

  const min = sorted[0];
  const max = sorted[size - 1];

  // Variance and Standard Deviation
  const variance =
    sorted.reduce((sum, val) => sum + math.pow(val - average, 2), 0) / size;
  const stdDev = math.sqrt(variance);

  // Mode
  const freqMap = new Map<number, number>();
  for (const num of data) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }
  const mode = Object.entries(freqMap).sort((a, b) => a[1] < b[1])[0][0];

  // Median Absolute Deviation (MAD)
  const median = getPercentileAverage(sorted, 0.25, 0.75);
  const deviations = sorted.map((val) => math.abs(val - median));
  const mad = getPercentileAverage(
    deviations.sort((a, b) => a < b),
    0.25,
    0.75,
  );

  return {
    Avg: average,
    "10%": getPercentileAverage(sorted, 0.0, 0.1),
    "50%": getPercentileAverage(sorted, 0.25, 0.75),
    "90%": getPercentileAverage(sorted, 0.0, 0.9),
    Min: min,
    Max: max,
    StdDev: stdDev,
    Mode: mode,
    MAD: mad,
  };
}
function ProfileLogStats(profileLogs: ProfileLog[]): Stats<ProfileLog> {
  let profileLogStats: Stats<ProfileLog> = {
    Avg: [],
    "10%": [],
    "50%": [],
    "90%": [],
    Min: [],
    Max: [],
    MAD: [],
    StdDev: [],
    Mode: [],
  };

  /* Make each of the stats time be elapsed */
  for (const profileLog of profileLogs) {
    for (const [index, entry] of pairs(profileLog)) {
      const nextTime = profileLog[index]?.time ?? 0;
      entry.time = math.max(0, ToMicroseconds(nextTime - entry.time));
    }
  }

  /* use ComputeStats */
  /** Format data for ComputeStats */
  let computeStatsData: { [index: number]: number[] } = {};
  let namesFromIndex: { [index: number]: string | false } = {};
  for (const profileLog of profileLogs) {
    for (const [index, entry] of pairs(profileLog)) {
      computeStatsData[index] ??= [];
      computeStatsData[index].push(entry.time);

      namesFromIndex[index] = entry.name;
    }
  }

  /** Run through ComputeStats */
  for (const [key, values] of pairs(computeStatsData)) {
    const stats = ComputeStats(values);
    for (const [statName, statResult] of pairs(stats)) {
      profileLogStats[statName].push({
        name: namesFromIndex[key],
        time: statResult,
      });
    }
  }

  return profileLogStats;
}
function ToMicroseconds(seconds: number) {
  return math.floor(seconds * 1000 * 1000);
}
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
): [Map<number, number>, Stats<ProfileLog>] {
  /* benchmark a single case in a module */
  let recordedTimes = new Map<number, number>(); /* time taken to calls map */
  const batching = Settings.GetSetting("Batching");

  table.clear(globalProfileLog);
  for (let count = 0; count <= calls; count++) {
    const parameter = requiredModule.Parameter();

    /* benchmark! */
    globalProfileLog.push([]); /* start on a new entry */

    const usingFunction = requiredModule.Functions[use];

    requiredModule.BeforeEach?.();
    const start = os.clock();
    usingFunction(BenchmarkLibrary, parameter);
    const end_ = os.clock();
    requiredModule.AfterEach?.();

    const elapsedTime = ToMicroseconds(end_ - start);

    /* record */
    const current = recordedTimes.get(elapsedTime) ?? 0;
    recordedTimes.set(elapsedTime, current + 1);

    if (count % batching === 0) task.wait();
    setCount(count);
  }

  return [recordedTimes, ProfileLogStats(globalProfileLog)];
}

/* Exported functions */
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
      require(module);
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
): [BenchmarkResults, Map<string, Stats<ProfileLog>>] | [] {
  /* benchmark all cases of a module */
  const totalResults = new Map<string, Map<number, number>>();
  const totalProfileLogs = new Map<string, Stats<ProfileLog>>();

  const requiredModule = require(
    module.Clone(),
  ) as FormattedBenchmarkScript<unknown>;

  // First, run all benchmarks and store the results
  xpcall(
    () => {
      const functions = Object.keys(requiredModule.Functions);

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
export function ToMicroprofilerData(results: Result[]): MicroProfilerData {
  const data: MicroProfilerData = {};
  for (const [index, result] of pairs(results)) {
    const lookingFor = result.NumberData.filter(
      (value) =>
        value[0] ===
        (Settings.GetSetting(
          "PrioritizedStat",
        ) as keyof typeof result.NumberData),
    )[0][1];
    data[result.Name] = lookingFor;
  }
  return data;
}
