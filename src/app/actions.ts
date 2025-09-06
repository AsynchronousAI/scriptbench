import { ComputeResults, GetBenchmarkableModules } from "benchmark";
import { Atoms } from "./atoms";
import { Settings } from "settings";
import { peek } from "@rbxts/charm";
import { GraphAtoms } from "./graph/atoms";
import { ProfileLog, Stats } from "benchmark/types";
import { Object } from "@rbxts/luau-polyfill";
import { Result } from "./results";
import { ProfileLogStats } from "benchmark/profiler";
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
  clearResults(); // Clear results on refresh
  clearExecution();
};

export const pinMicroProfiler = (parentName: string, name: string) => {
  const fullName = `${parentName} (${name})`;
  const isInResults = peek(Atoms.results)?.some(
    (result) => result.Name === fullName,
  );

  if (isInResults) {
    let filteredData = peek(Atoms.data)!.filter(
      (data) => data.name !== fullName,
    );

    Atoms.results((prev) => prev!.filter((result) => result.Name !== fullName));
    Atoms.data(
      FilterMap(
        filteredData,
        peek(Atoms.calls) / Settings.GetSetting("OutlierDivider"),
      ),
    );
    return;
  }

  /** convert Stats for ProfilerLog to just Stats<number> for the specific block */
  let micoprofilerStat: Partial<Stats<number>> = {};
  for (const stats of Object.values(peek(Atoms.microprofilerStats)!)) {
    for (const [stat, microprofilerData] of Object.entries(stats)) {
      for (const item of Object.values(microprofilerData)) {
        if (item.name !== name) continue;
        micoprofilerStat[stat] = item.time;
      }
    }
  }

  /** create an object to add to the sidebar */
  const NumberData = Object.entries(micoprofilerStat);
  if (NumberData.size() === 0) return; /* nothing good to show */
  const newItem = {
    Name: fullName,
    Order: micoprofilerStat[Settings.GetSetting("PrioritizedStat")],
    NumberData: Object.entries(micoprofilerStat),
    IsMicroProfiler: true,
    Index: peek(Atoms.results)!.size() + 1,
  } as Result;

  /** create an object to add to the graph */
  const runTimeData = peek(Atoms.profileLogs)!.get(parentName)!;

  /* step 1. merge all the test runs into one giant array */
  const mergedData: ProfileLog = [];
  for (const batch of runTimeData) {
    for (const run of batch) {
      mergedData.push(run);
    }
  }

  /* step 2. filter an array of just this datas times */
  const thisBlockData = mergedData.filter((log) => log.name === name);

  /* step 3. create a map of the frequency of each time */
  const thisBlockTimes = thisBlockData.map((log) => log.time);
  let newData: { [key: number]: number } = {};
  for (const time of thisBlockTimes) {
    newData[time] = (newData[time] || 0) + 1;
  }

  Atoms.results((prev) => [...prev!, newItem]);
  Atoms.data((prev) =>
    FilterMap(
      [...prev!, { name: fullName, data: newData, highlightedX: 1 }],
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
  Atoms.highlightedX({}); /* computed in the useEffect in app.tsx */

  clearExecution();
};
