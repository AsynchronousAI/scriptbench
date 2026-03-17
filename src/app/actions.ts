import { ComputeResults, GetBenchmarkableModules } from "benchmark";
import { BenchmarkLibrary } from "benchmark/lib";
import { FormattedBenchmarkScript, ProfileLog, Stats } from "benchmark/types";
import { peek } from "@rbxts/charm";
import { Object } from "@rbxts/luau-polyfill";
import { Atoms } from "./atoms";
import { GraphAtoms } from "./graph/atoms";
import { GraphData } from "./graph/types";
import { Settings } from "settings";
import {
  ProfileLogStats,
  buildFrequencyMap,
  getStatsForBlock,
} from "benchmark/profiler";
import { Result } from "./results";

const MIN_FLUSH_INTERVAL = 0.1;
const MIN_SAMPLE_WINDOW = 25;

const toMicroseconds = (seconds: number) =>
  math.max(0, math.floor(seconds * 1e6));

const buildSeries = (
  names: string[],
): LuaTuple<[GraphData, Map<string, GraphData[number]>]> => {
  const data: GraphData = [];
  const lookup = new Map<string, GraphData[number]>();

  for (const name of names) {
    const series: GraphData[number] = { name, data: {} };
    data.push(series);
    lookup.set(name, series);
  }

  return $tuple(data, lookup);
};

const flushVisualization = (
  raw: GraphData,
  completed: number,
  total: number,
) => {
  if (raw.size() === 0) return;

  const stats = ComputeResults(raw);
  const rawSnapshot = raw.map((series) => ({
    name: series.name,
    data: { ...series.data },
    highlightedX: series.highlightedX,
  }));

  Atoms.data(rawSnapshot);
  Atoms.results(stats);
  Atoms.progress(math.clamp(math.floor((completed / total) * 100), 0, 100));
};

const runLiveBenchmark = (module: ModuleScript, calls: number) => {
  const required = require(module) as FormattedBenchmarkScript<unknown>;
  if (!required.Functions) throw "Benchmark module has no Functions table.";

  const functions = Object.entries(required.Functions);
  if (functions.size() === 0)
    throw "Benchmark module has no benchmarkable functions.";

  const [rawData, lookup] = buildSeries(
    functions.map(([name]) => name as string),
  );
  const totalSamples = math.max(1, calls * functions.size());
  const batching = math.max(1, Settings.GetSetting("Batching"));
  const sampleWindow = math.max(MIN_SAMPLE_WINDOW, batching);

  table.clear(BenchmarkLibrary.ProfileLog);
  const profileLogs = new Map<string, ProfileLog[]>();

  let completed = 0;
  let lastFlush = 0;

  const parameterFactory =
    required.Parameter ??
    required.ParameterGenerator ??
    (() => undefined as unknown);

  required.BeforeAll?.();

  for (const [name, fn] of functions) {
    const series = lookup.get(name as string)!;
    const benchmarkFn = fn as (
      lib: typeof BenchmarkLibrary,
      arg?: unknown,
    ) => void;
    const logs: ProfileLog[] = [];
    profileLogs.set(name as string, logs);

    for (let iteration = 1; iteration <= calls; iteration++) {
      BenchmarkLibrary.ProfileLog.push([]);
      const logIndex = BenchmarkLibrary.ProfileLog.size() - 1;

      required.BeforeEach?.();
      const start = os.clock();
      benchmarkFn(BenchmarkLibrary, parameterFactory());
      const elapsed = toMicroseconds(os.clock() - start);
      required.AfterEach?.();

      series.data[elapsed] = (series.data[elapsed] ?? 0) + 1;
      logs.push(table.clone(BenchmarkLibrary.ProfileLog[logIndex]));
      completed += 1;

      const now = os.clock();
      const shouldFlush =
        completed === totalSamples ||
        iteration % sampleWindow === 0 ||
        now - lastFlush >= MIN_FLUSH_INTERVAL;

      if (shouldFlush) {
        lastFlush = now;
        Atoms.status(`${name} (${iteration}/${calls})`);
        flushVisualization(rawData, completed, totalSamples);
      }

      if (iteration % batching === 0) task.wait();
    }
  }

  required.AfterAll?.();

  const microprofilerStats = new Map<string, Stats<ProfileLog>>();
  for (const [name, logs] of profileLogs) {
    if (logs.size() === 0) continue;
    microprofilerStats.set(name as string, ProfileLogStats(logs));
  }

  Atoms.microprofilerStats(microprofilerStats);
  Atoms.profileLogs(profileLogs);
  Atoms.status("Complete");
  flushVisualization(rawData, totalSamples, totalSamples);
};

export const clearResults = () => {
  Atoms.errorMessage(undefined);
  Atoms.highlightedX({});
  Atoms.results(undefined);
  Atoms.data(undefined);
  Atoms.lastRunCallCount(undefined);
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
  const fresh = GetBenchmarkableModules();
  Atoms.availableBenchmarks(fresh);
  Atoms.openedBenchmark((prev) =>
    prev && fresh.includes(prev) ? prev : undefined,
  );
  Atoms.openedMenu(undefined);
  clearResults();
  clearExecution();
};

export const pinMicroProfiler = (parentName: string, name: string) => {
  const fullName = `${parentName} (${name})`;

  const alreadyPinned = peek(Atoms.results)?.some(
    (result) => result.Name === fullName,
  );
  if (alreadyPinned) {
    Atoms.results((prev) => prev?.filter((result) => result.Name !== fullName));
    Atoms.data((prev) =>
      prev ? prev.filter((series) => series.name !== fullName) : prev,
    );
    return;
  }

  const microStats = peek(Atoms.microprofilerStats);
  const logsByFunction = peek(Atoms.profileLogs);
  if (!microStats || !logsByFunction) return;

  const blockStats = getStatsForBlock(microStats, parentName, name);
  const statEntries = Object.entries(blockStats);
  if (statEntries.size() === 0) return;

  const selectedLogs = logsByFunction.get(parentName);
  if (!selectedLogs) return;

  const newResult: Result = {
    Name: fullName,
    Order: blockStats[Settings.GetSetting("PrioritizedStat")] ?? 0,
    NumberData: statEntries,
    IsMicroProfiler: true,
  };

  const freqMap = buildFrequencyMap(selectedLogs, name);

  Atoms.results((prev) => [...(prev ?? []), newResult]);

  const newSeries = { name: fullName, data: { ...freqMap } };

  Atoms.data((prev) => [...(prev ?? []), newSeries]);
};

export const startBenchmark = () => {
  const benchmark = peek(Atoms.openedBenchmark);
  if (!benchmark) return;

  clearResults();
  clearExecution();

  Atoms.isRunning(true);
  Atoms.status("Preparing…");
  Atoms.progress(0);

  GraphAtoms.zoom(1);
  GraphAtoms.focusedX(0);

  const calls = math.max(1, math.floor(peek(Atoms.calls)));
  Atoms.lastRunCallCount(calls);
  const clone = benchmark.Clone();

  task.spawn(() => {
    try {
      runLiveBenchmark(clone, calls);
    } catch (err) {
      Atoms.errorMessage(tostring(err));
    } finally {
      clone.Destroy();
      clearExecution();
    }
  });
};
