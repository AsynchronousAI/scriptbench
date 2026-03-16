import { Object } from "@rbxts/luau-polyfill";
import { FormattedBenchmarkScript, ProfileLog } from "./types";
import { Settings } from "settings";
import { BenchmarkLibrary } from "./lib";
import { ToMicroseconds } from "./profiler";
import { GraphData } from "app/graph/types";

const clock = os.clock;

const BINS = 50; // Path2D only supports up to 100 control points (50 since steps makes 2)
export function BinData(
  data: GraphData,
  threshold: number,
  filterOutliers: boolean,
): GraphData {
  return data.map((series) => {
    const keys = Object.keys(series.data).map((k) => tonumber(k) as number);
    if (keys.size() === 0) return series;

    const domainMin = math.min(...keys);
    const domainMax = math.max(...keys);
    const domainRange = domainMax - domainMin;

    // Degenerate case: all measurements identical
    if (domainRange === 0) {
      return { ...series, data: { [domainMin]: series.data[domainMin] } };
    }

    const binWidth = domainRange / BINS;
    const bins: { [key: number]: number } = {};

    for (const [key, count] of Object.entries(series.data)) {
      const x = tonumber(key) as number;
      const binIndex = math.floor((x - domainMin) / binWidth);
      const binX = math.floor(domainMin + (binIndex + 0.5) * binWidth);
      bins[binX] = (bins[binX] ?? 0) + (count as number);
    }

    // Apply outlier threshold
    const binned: { [key: number]: number } = {};
    for (const [x, count] of Object.entries(bins)) {
      if (!filterOutliers || (count as number) >= threshold) {
        binned[tonumber(x) as number] = count as number;
      }
    }

    return {
      name: series.name,
      data: binned,
      highlightedX: series.highlightedX,
    };
  });
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

  return [totalResults, totalProfileLogs];
}
