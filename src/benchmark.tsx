import { Object } from "@rbxts/luau-polyfill";
import { Result } from "app/results";
import { GetKeyColor, GraphData } from "graph";

const precision = 5; /* 5 digits of precision compared to a second */
const requiredPrefix = ".bench";

interface FormattedBenchmarkScript<T> {
  ParameterGenerator: () => T;
  Functions: { [name: string]: (arg: T) => void };
}

function ComputeStarts(data: { [key: number]: number }) {
  const values = Object.values(data);
  if (values.size() === 0) {
    throw "Data is empty.";
  }

  const sorted = [...values].sort();

  const size = sorted.size();
  const average = values.reduce((sum: number, v: number) => sum + v, 0) / size;

  const getPercentileAverage = (startPercent: number, endPercent: number) => {
    const startIndex = math.floor(size * startPercent);
    const endIndex = math.floor(size * endPercent);

    let sum = 0;
    let count = 0;
    for (let i = startIndex; i < endIndex && i < size; i++) {
      sum += sorted[i];
      count += 1;
    }
    return count > 0 ? sum / count : 0;
  };

  const min = sorted[0];
  const max = sorted[sorted.size() - 1];

  return {
    average,
    average10: getPercentileAverage(0, 0.1), // Lowest 10%
    average50: getPercentileAverage(0.25, 0.75), // Middle 50%
    average90: getPercentileAverage(0, 0.9), // Highest 90%
    min,
    max,
  };
}

export function ComputeResults(data: GraphData): Result[] {
  let results: Result[] = [];

  for (const [name] of pairs(data)) {
    const stats = ComputeStarts(data[name]);
    results.push({
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

export function GetBenchmarkableModules() {
  let validModules = [];
  for (const module of game.GetDescendants()) {
    if (!module.IsA("ModuleScript")) continue;
    if (
      module.Name.sub(module.Name.size() - requiredPrefix.size()) !==
      requiredPrefix
    )
      continue; /* does not match required suffix */

    validModules.push(module);
  }

  return validModules;
}
function Benchmark(
  requiredModule: FormattedBenchmarkScript<unknown>,
  use: string,
  calls: number,
) {
  /* benchmark a single case in a module */
  let recordedTimes = new Map<number, number>(); /* time taken to calls map */

  for (let count = 0; count++; count <= calls) {
    const parameter = requiredModule.ParameterGenerator();

    /* benchmark! */
    const start = tick();
    requiredModule.Functions[use](parameter);
    const end_ = tick();

    const elapsedTime =
      math.floor((end_ - start) * 10 ** precision) / 10 ** precision;

    /* record */
    const current = recordedTimes.get(elapsedTime) ?? 0;
    recordedTimes.set(elapsedTime, current + 1);
  }

  return recordedTimes;
}
export default function BenchmarkAll(module: ModuleScript, calls: number) {
  /* benchmark all cases of a module */
  let totalResults = new Map<string, Map<number, number>>();
  const requiredModule = require(module) as FormattedBenchmarkScript<unknown>;

  for (const [benchmarkName] of pairs(requiredModule.Functions)) {
    const results = Benchmark(requiredModule, benchmarkName as string, calls);
    totalResults.set(module.Name, results);
  }

  return totalResults;
}
