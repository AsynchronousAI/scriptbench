import { ComputeResults, GetBenchmarkableModules } from "benchmark";
import { Atoms } from "./atoms";
import { Settings } from "settings";
import { peek } from "@rbxts/charm";
import { GraphAtoms } from "./graph/atoms";
import { ProfileLog, Stats } from "benchmark/types";
import { Object } from "@rbxts/luau-polyfill";
import { Result } from "./results";
import {
  ProfileLogStats,
  getStatsForBlock,
  buildFrequencyMap,
} from "benchmark/profiler";
import BenchmarkAll, { FilterMap } from "benchmark/benchmark";

export const clearResults = () => {
  Atoms.errorMessage(undefined);
  Atoms.highlightedX({});
  Atoms.results(undefined);
  Atoms.data(undefined);
  Atoms.microprofilerStats(undefined);
  Atoms.profileLogs(undefined);
};

export const clearExecution = () => {
  Atoms.isRunning(false);
  Atoms.progress(undefined);
  Atoms.status(undefined);
};

export const selectBenchmark = (benchmark: ModuleScript) => {
  Atoms.openedBenchmark(benchmark);
  Atoms.openedMenu("benchmark");
  clearResults();
  clearExecution();
};

export const refreshBenchmarks = () => {
  const newBenchmarks = GetBenchmarkableModules();
  Atoms.availableBenchmarks(newBenchmarks);
  Atoms.openedBenchmark((prev) =>
    prev && newBenchmarks.includes(prev) ? prev : undefined,
  );
  Atoms.openedMenu(undefined);
  clearResults();
  clearExecution();
};

export const pinMicroProfiler = (parentName: string, name: string) => {
  const fullName = `${parentName} (${name})`;

  const isInResults = peek(Atoms.results)?.some((r) => r.Name === fullName);
  if (isInResults) {
    Atoms.results((prev) => prev!.filter((r) => r.Name !== fullName));
    Atoms.data((prev) =>
      FilterMap(
        prev!.filter((d) => d.name !== fullName),
        peek(Atoms.calls) / Settings.GetSetting("OutlierDivider"),
      ),
    );
    return;
  }

  const blockStats = getStatsForBlock(
    peek(Atoms.microprofilerStats)!,
    parentName,
    name,
  );
  const statEntries = Object.entries(blockStats);
  if (statEntries.size() === 0) return;

  const newResult: Result = {
    Name: fullName,
    Order: blockStats[Settings.GetSetting("PrioritizedStat")] ?? 0,
    NumberData: statEntries,
    IsMicroProfiler: true,
  };
  const freqMap = buildFrequencyMap(
    peek(Atoms.profileLogs)!.get(parentName)!,
    name,
  );

  Atoms.results((prev) => [...prev!, newResult]);
  Atoms.data((prev) =>
    FilterMap(
      [...prev!, { name: fullName, data: freqMap }],
      peek(Atoms.calls) / Settings.GetSetting("OutlierDivider"),
    ),
  );
};

export const startBenchmark = () => {
  if (!peek(Atoms.openedBenchmark)) return;

  clearResults();
  Atoms.isRunning(true);
  Atoms.progress(0);

  const calls = peek(Atoms.calls);

  const [result, profileLogs] = BenchmarkAll(
    peek(Atoms.openedBenchmark)!,
    calls,
    (count, status) => {
      Atoms.progress(math.map(count, 0, calls, 0, 100));
      Atoms.status(status);
    },
    (err) => {
      Atoms.errorMessage(err);
      clearExecution();
    },
  );

  if (!result) return;

  const filteredResults = FilterMap(
    result,
    calls / Settings.GetSetting("OutlierDivider"),
  );

  const computedResults = ComputeResults(
    Settings.GetSetting("FilterOutliers") ? filteredResults : result,
  );

  // Compute microprofiler stats for all benchmarks upfront
  const microprofilerStats = new Map<string, Stats<ProfileLog>>();
  for (const [key, value] of Object.entries(profileLogs!)) {
    microprofilerStats.set(key as string, ProfileLogStats(value));
  }

  GraphAtoms.zoom(1);
  GraphAtoms.focusedX(0);
  Atoms.data(filteredResults);
  Atoms.results(computedResults);
  Atoms.microprofilerStats(microprofilerStats);
  Atoms.profileLogs(profileLogs);
  Atoms.highlightedX({});

  clearExecution();
};
