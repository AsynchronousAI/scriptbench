import { Stats } from "benchmark";

/** Configurations */
export const LABEL_THICKNESS = 0.075;
export const DOMAIN_LABELS = 5;
export const RANGE_LABELS = 5;
export const LINE_WIDTH = 2.5;
export const LABEL_TEXT_SIZE = 16;

export const Configuration: {
  PrioritizedStat: keyof Stats<unknown>;
  ComputeStatsFiltered: boolean;
} = {
  PrioritizedStat: "50%",
  ComputeStatsFiltered: true,
};
