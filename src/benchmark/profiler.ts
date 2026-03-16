import { MicroProfilerData } from "app/microprofiler";
import { ComputeStats } from "./stats";
import { ProfileLog, Stats } from "./types";
import { Result } from "app/results";
import { Settings } from "settings";

export function ToMicroseconds(seconds: number) {
  return math.floor(seconds * 1000 * 1000);
}

/**
 * Converts a flat ProfileLog into a map of block name → elapsed microseconds
 * for a single run. Each named "begin" entry is paired with the next entry
 * whose name is `false` (the matching "end"), so nested or sequential blocks
 * are handled correctly without mutating the log.
 */
function elapsedTimesForRun(log: ProfileLog): Map<string, number> {
  const result = new Map<string, number>();
  for (let i = 0; i < log.size(); i++) {
    const entry = log[i];
    if (entry.name === false) continue; // skip end markers

    // Find the next end marker for this begin
    const endEntry = log[i + 1];
    if (!endEntry || endEntry.name !== false) continue;

    const elapsed = math.max(0, ToMicroseconds(endEntry.time - entry.time));
    result.set(entry.name, (result.get(entry.name) ?? 0) + elapsed);
  }
  return result;
}

/**
 * Given all runs for a benchmark, computes Stats<ProfileLog> where each
 * stat bucket contains one entry per named block with its aggregate value.
 *
 * Replaces the previous two-pass, index-keyed approach with a name-keyed one
 * that is order-independent and doesn't mutate the input logs.
 */
export function ProfileLogStats(profileLogs: ProfileLog[]): Stats<ProfileLog> {
  // Collect all elapsed times per block name across all runs
  const timesByName = new Map<string | false, number[]>();
  for (const log of profileLogs) {
    for (const [name, elapsed] of elapsedTimesForRun(log)) {
      const existing = timesByName.get(name) ?? [];
      existing.push(elapsed);
      timesByName.set(name, existing);
    }
  }

  // Build Stats<ProfileLog> by running ComputeStats per block
  const result: Stats<ProfileLog> = {
    Avg: [],
    "10%": [],
    "50%": [],
    "90%": [],
    Min: [],
    Max: [],
    StdDev: [],
    Mode: [],
    MAD: [],
  };

  for (const [name, times] of timesByName) {
    const stats = ComputeStats(times);
    for (const [statName, statValue] of pairs(stats)) {
      result[statName].push({ name, time: statValue });
    }
  }

  return result;
}

/**
 * Extracts Stats<number> for a single named block from a Stats<ProfileLog>.
 * Used by pinMicroProfiler to build a sidebar Result without re-scanning everything.
 */
export function getStatsForBlock(
  microprofilerStats: Map<string, Stats<ProfileLog>>,
  parentName: string,
  blockName: string,
): Partial<Stats<number>> {
  const stats = microprofilerStats.get(parentName);
  if (!stats) return {};

  const result: Partial<Stats<number>> = {};
  for (const [statName, entries] of pairs(stats)) {
    const match = (entries as ProfileLog).find((e) => e.name === blockName);
    if (match !== undefined) result[statName] = match.time;
  }
  return result;
}

/**
 * Builds a frequency map (time → count) for a named block across all runs,
 * used to add a new series to the graph when pinning a microprofiler block.
 */
export function buildFrequencyMap(
  profileLogs: ProfileLog[],
  blockName: string,
): { [key: number]: number } {
  const freq: { [key: number]: number } = {};
  for (const log of profileLogs) {
    for (const [name, elapsed] of elapsedTimesForRun(log)) {
      if (name !== blockName) continue;
      freq[elapsed] = (freq[elapsed] ?? 0) + 1;
    }
  }
  return freq;
}

/**
 * Maps each non-microprofiler Result to its prioritized stat value,
 * used to render the main bar in the MicroProfiler component.
 */
export function ToMicroprofilerData(results: Result[]): MicroProfilerData {
  const prioritized = Settings.GetSetting("PrioritizedStat");
  const data: MicroProfilerData = {};
  for (const result of results) {
    if (result.IsMicroProfiler) continue;
    const entry = result.NumberData.find(([key]) => key === prioritized);
    if (entry) data[result.Name] = entry[1];
  }
  return data;
}
