import { Stats } from "./types";

function getPercentile(sorted: number[], percent: number): number {
  return sorted[
    math.clamp(math.round(sorted.size() * percent), 0, sorted.size() - 1)
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
  const median = getPercentile(sorted, 0.5);

  const variance =
    sorted.reduce((sum, val) => sum + math.pow(val - average, 2), 0) / size;
  const stdDev = math.sqrt(variance);

  const freqMap = new Map<number, number>();
  for (const num of data) {
    freqMap.set(num, (freqMap.get(num) ?? 0) + 1);
  }
  let mode = data[0];
  let modeFreq = 0;
  for (const [num, freq] of freqMap) {
    if (freq > modeFreq) {
      mode = num;
      modeFreq = freq;
    }
  }

  // Median Absolute Deviation
  const deviations = sorted.map((val) => math.abs(val - median)).sort();
  const mad = getPercentile(deviations, 0.5);

  return {
    Avg: average,
    "10%": getPercentile(sorted, 0.1),
    "50%": median,
    "90%": getPercentile(sorted, 0.9),
    Min: min,
    Max: max,
    StdDev: stdDev,
    Mode: mode,
    MAD: mad,
  };
}
