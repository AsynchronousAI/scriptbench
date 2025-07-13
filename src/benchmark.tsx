import { Array, Object, String } from "@rbxts/luau-polyfill";
import { Result } from "app/results";
import { GetKeyColor, GraphData } from "graph";

const REQUIRED_PREFIX = ".bench";
const YIELD = 250;

interface FormattedBenchmarkScript<T> {
  ParameterGenerator: () => T;
  Functions: { [name: string]: (profiler: undefined, arg: T) => void };
}

function ComputeStarts(data: { [key: number]: number }) {
  const keys = Object.keys(data); // Get keys and convert them to numbers
  if (keys.size() === 0) {
    throw "Data is empty.";
  }

  const sortedKeys = [...keys].sort(); // Sort the keys in ascending order

  const size = sortedKeys.size();
  const average =
    sortedKeys.reduce((sum: number, key: number) => sum + key, 0) / size;

  const getPercentileAverage = (startPercent: number, endPercent: number) => {
    const startIndex = math.floor(size * startPercent);
    const endIndex = math.floor(size * endPercent);

    let sum = 0;
    let count = 0;
    for (let i = startIndex; i < endIndex && i < size; i++) {
      sum += sortedKeys[i];
      count += 1;
    }
    return count > 0 ? sum / count : 0;
  };

  const min = sortedKeys[0];
  const max = sortedKeys[sortedKeys.size() - 1];

  return {
    average,
    average10: getPercentileAverage(0, 0.1), // Lowest 10%
    average50: getPercentileAverage(0.25, 0.75), // Middle 50%
    average90: getPercentileAverage(0, 0.9), // Highest 90%
    min,
    max,
  };
}

function ToMicroseconds(seconds: number) {
  return math.floor(seconds * 1000 * 1000);
}

export function ComputeResults(data: GraphData): Result[] {
  let results: Result[] = [];

  for (const [name] of pairs(data)) {
    const stats = ComputeStarts(data[name]);
    results.push({
      Order: stats.average50,
      Name: name as string,
      Color: GetKeyColor(name as string)[0],
      NumberData: [
        ["Avg", stats.average],
        ["10%", stats.average10],
        ["50%", stats.average50],
        ["90%", stats.average90],
        ["Min", stats.min],
        ["Max", stats.max],
      ],
    });
  }
  return results;
}
function FilterMap(
  map: Map<number, number>,
  threshold: number,
): Map<number, number> {
  const result = new Map<number, number>();

  for (const [key, value] of Object.entries(map)) {
    if (value > threshold) {
      result.set(key, value);
    }
  }

  return result;
}

export function GetBenchmarkableModules() {
  let validModules = [];
  for (const module of game.GetDescendants()) {
    if (!module.IsA("ModuleScript")) continue;
    if (!String.endsWith(module.Name, REQUIRED_PREFIX))
      continue; /* does not match required suffix */

    validModules.push(module);
  }

  return validModules;
}

function Benchmark(
  requiredModule: FormattedBenchmarkScript<unknown>,
  use: string,
  calls: number,

  setCount: (count: number) => void,
) {
  /* benchmark a single case in a module */
  let recordedTimes = new Map<number, number>(); /* time taken to calls map */

  for (let count = 0; count <= calls; count++) {
    const parameter = requiredModule.ParameterGenerator();

    /* benchmark! */
    const start = tick();
    requiredModule.Functions[use](undefined, parameter);
    const end_ = tick();

    const elapsedTime = ToMicroseconds(end_ - start);

    /* record */
    const current = recordedTimes.get(elapsedTime) ?? 0;
    recordedTimes.set(elapsedTime, current + 1);

    if (count % YIELD === 0) task.wait();
    setCount(count);
  }

  return FilterMap(recordedTimes, 5);
}
export default function BenchmarkAll(
  module: ModuleScript,
  calls: number,
  setCount?: (count: number, status: string) => void,
) {
  /* benchmark all cases of a module */
  const totalResults = new Map<string, Map<number, number>>();
  const requiredModule = require(module) as FormattedBenchmarkScript<unknown>;

  // First, run all benchmarks and store the results
  let index = 0;
  const functions = Object.keys(requiredModule.Functions);
  for (const benchmarkName of functions) {
    const results = Benchmark(
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

    index++;
  }

  return totalResults;
}
