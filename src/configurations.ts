import { Stats } from "benchmark";

export const Configuration: {
  PrioritizedStat: keyof Stats<unknown>;
} = {
  PrioritizedStat: "Avg",
};
