import { MicroProfilerData } from "app/microprofiler";
import { ComputeStats } from "./stats";
import { ProfileLog, Stats } from "./types";
import { Result } from "app/results";
import { Settings } from "settings";

export function ToMicroseconds(seconds: number) {
  return math.floor(seconds * 1000 * 1000);
}
export function ProfileLogStats(profileLogs: ProfileLog[]): Stats<ProfileLog> {
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
export function ToMicroprofilerData(results: Result[]): MicroProfilerData {
  const data: MicroProfilerData = {};
  for (const [index, result] of pairs(results)) {
    if (result.IsMicroProfiler) continue;

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
