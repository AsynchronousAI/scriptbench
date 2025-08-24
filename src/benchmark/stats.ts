import { Object } from "@rbxts/luau-polyfill";
import { Stats } from "./types";

function getPercentileAverage(sortedKeys: number[], percent: number): number {
  return sortedKeys[
    math.clamp(math.round(sortedKeys.size() * percent), 0, sortedKeys.size())
  ];
}
export function ComputeStats(data: number[]): Stats<number> {
  if (data.size() === 0) {
    throw "Data array must not be empty.";
  }

  const sorted = [...data].sort();
  const size = sorted.size();

  const average = sorted.reduce((sum, value) => sum + value, 0) / size;

  const min = sorted[0];
  const max = sorted[size - 1];

  // Variance and Standard Deviation
  const variance =
    sorted.reduce((sum, val) => sum + math.pow(val - average, 2), 0) / size;
  const stdDev = math.sqrt(variance);

  // Mode
  const freqMap = new Map<number, number>();
  for (const num of data) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }
  const mode = Object.entries(freqMap).sort((a, b) => a[1] < b[1])[0][0];

  // Median Absolute Deviation (MAD)
  const median = getPercentileAverage(sorted, 0.5);
  const deviations = sorted.map((val) => math.abs(val - median));
  const mad = getPercentileAverage(
    deviations.sort((a, b) => a < b),
    0.5,
  );

  return {
    Avg: average,
    "10%": getPercentileAverage(sorted, 0.1),
    "50%": median,
    "90%": getPercentileAverage(sorted, 0.9),
    Min: min,
    Max: max,
    StdDev: stdDev,
    Mode: mode,
    MAD: mad,
  };
}
