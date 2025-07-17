import { Stats } from "benchmark";

export const Configuration: {
  PrioritizedStat: keyof Stats<unknown>;
  ComputeStatsFiltered: boolean;
} = {
  PrioritizedStat: "50%",
  ComputeStatsFiltered: true,
};
