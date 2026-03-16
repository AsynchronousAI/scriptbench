import { Object } from "@rbxts/luau-polyfill";
import { FormattedBenchmarkScript, ProfileLog } from "./types";
import { Settings } from "settings";
import { BenchmarkLibrary } from "./lib";
import { ToMicroseconds } from "./profiler";
import { GraphData } from "app/graph/types";

const clock = os.clock;

/**
 * Removes time buckets from graph data whose frequency is below `threshold`.
 * This strips outlier spikes that occur fewer times than calls/OutlierDivider.
 */
export function FilterMap(data: GraphData, threshold: number): GraphData {
  const result: GraphData = [];

  for (const inner of data) {
    const filtered: { [key: number]: number } = {};

    for (const [key, count] of Object.entries(inner.data)) {
      if (count >= threshold) {
        filtered[tonumber(key)!] = count;
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
  const recordedTimes: { [key: number]: number } = {};
  const batching = Settings.GetSetting("Batching");

  table.clear(BenchmarkLibrary.ProfileLog);

  const usingFunction = requiredModule.Functions![use];

  for (let count = 0; count <= calls; count++) {
    const parameter: unknown[] = requiredModule.Parameter
      ? [requiredModule.Parameter()]
      : requiredModule.ParameterGenerator
        ? [requiredModule.ParameterGenerator()]
        : [];

    BenchmarkLibrary.ProfileLog.push([]);

    requiredModule.BeforeEach?.();
    const start = clock();
    usingFunction(BenchmarkLibrary, ...(parameter as [unknown]));
    const elapsed = ToMicroseconds(clock() - start);
    requiredModule.AfterEach?.();

    recordedTimes[elapsed] = (recordedTimes[elapsed] ?? 0) + 1;

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
  const totalResults: GraphData = [];
  const totalProfileLogs = new Map<string, ProfileLog[]>();

  const requiredModule = require(
    module.Clone(),
  ) as FormattedBenchmarkScript<unknown>;
  const functions = Object.keys(requiredModule.Functions!);

  xpcall(
    () => {
      requiredModule.BeforeAll?.();

      for (const [index, benchmarkName] of Object.entries(functions)) {
        const [results, profileLog] = Benchmark(
          requiredModule,
          benchmarkName as string,
          calls,
          (v) =>
            setCount?.(
              ((index - 1) * calls + v) / functions.size(),
              `${benchmarkName} (${v})`,
            ),
        );

        totalResults.push({ name: benchmarkName as string, data: results });
        totalProfileLogs.set(benchmarkName as string, profileLog);
      }

      requiredModule.AfterAll?.();
    },
    (errorMessage) => onError?.(errorMessage as string),
  );

  // Fill gaps: ensure every series has an entry for every time bucket present
  // in any series, so graph lines share the same X domain.
  let minimumX = math.huge;
  let maximumX = -math.huge;
  for (const results of totalResults) {
    for (const x of Object.keys(results.data)) {
      minimumX = math.min(minimumX, x);
      maximumX = math.max(maximumX, x);
    }
  }
  for (const results of totalResults) {
    for (let i = minimumX; i <= maximumX; i++) {
      results.data[i] ??= 0;
    }
  }

  return [totalResults, totalProfileLogs];
}
