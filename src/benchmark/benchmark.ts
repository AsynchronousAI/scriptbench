import { Object } from "@rbxts/luau-polyfill";
import { FormattedBenchmarkScript, ProfileLog } from "./types";
import { Settings } from "settings";
import { BenchmarkLibrary } from "./lib";
import { ToMicroseconds } from "./profiler";
import { GraphData } from "app/graph/types";

const clock = os.clock;
export function FilterMap(data: GraphData, threshold: number): GraphData {
  const result: GraphData = [];

  for (const [index, inner] of Object.entries(data)) {
    const filtered: { [key: number]: number } = {};

    for (const [numKey, value] of Object.entries(inner.data)) {
      const numericKey = tonumber(numKey)!;
      if (value === undefined) continue;
      if (value > threshold) {
        filtered[numericKey] = value;
      }
    }

    if (Object.keys(filtered).size() > 0) {
      result.push({
        name: inner.name,
        data: filtered,
        highlightedX: inner.highlightedX,
      });
    }
  }

  return result;
}
function Benchmark(
  requiredModule: FormattedBenchmarkScript<unknown>,
  use: string,
  calls: number,

  setCount: (count: number) => void,
): [{ [key: number]: number }, ProfileLog[]] {
  /* benchmark a single case in a module */
  let recordedTimes: { [key: number]: number } =
    {}; /* time taken to calls map */
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
    const current = recordedTimes[elapsedTime] ?? 0;
    recordedTimes[elapsedTime] = current + 1;

    if (count % batching === 0) task.wait();
    setCount(count);
  }

  return [recordedTimes, table.clone(BenchmarkLibrary.ProfileLog)];
}
export default function BenchmarkAll(
  module: ModuleScript,
  calls: number,
  setCount?: (count: number, status: string) => void,
  onError?: (error: string) => void,
): [GraphData, Map<string, ProfileLog[]>] | [] {
  /* benchmark all cases of a module */
  const totalResults: GraphData = [];
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

        totalResults.push({ name: benchmarkName as string, data: results });
        totalProfileLogs.set(benchmarkName as string, profileLog);

        index++;
      }

      requiredModule.AfterAll?.();
    },
    (errorMessage) => onError?.(errorMessage as string),
  );

  /* Post processing */
  /** Make sure all data has matching indexs, and if one does not have data make it 0 */
  let minimumX = math.huge;
  for (const [_, results] of pairs(totalResults)) {
    for (const [x, y] of pairs(results.data)) {
      minimumX = math.min(minimumX, x);
    }
  }

  for (const [_, results] of pairs(totalResults)) {
    for (let i = minimumX; i <= math.max(...Object.keys(results.data)); i++) {
      if (results.data[i] === undefined) results.data[i] = 0;
    }
  }

  return [totalResults, totalProfileLogs];
}
