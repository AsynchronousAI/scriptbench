import { atom } from "@rbxts/charm";
import { Result } from "./results";
import { ProfileLog, Stats } from "benchmark/types";
import { GraphData } from "./graph/types";

export const Atoms = {
  availableBenchmarks: atom<ModuleScript[]>([]),
  openedBenchmark: atom<ModuleScript | undefined>(undefined),
  calls: atom<number>(1250),
  mode: atom<"FPS" | "Histogram">("Histogram"),
  openedMenu: atom<"settings" | "benchmark" | undefined>(undefined),
  errorMessage: atom<string | undefined>(undefined),
  isRunning: atom<boolean>(false),
  progress: atom<number | undefined>(undefined),
  status: atom<string | undefined>(undefined),
  data: atom<GraphData | undefined>(undefined),
  results: atom<Result[] | undefined>(undefined),
  microprofilerStats: atom<Map<string, Stats<ProfileLog>> | undefined>(
    undefined,
  ),
  highlightedX: atom<{ [key: string]: number }>({}),
  profileLogs: atom<Map<string, ProfileLog[]> | undefined>(undefined),
};
