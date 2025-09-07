import { atom } from "@rbxts/charm";
import { Result } from "./results";
import { ProfileLog, Stats } from "benchmark/types";
import { GraphData } from "./graph/types";
export namespace Atoms {
  export const availableBenchmarks = atom<ModuleScript[]>([]);
  export const openedBenchmark = atom<ModuleScript | undefined>(undefined);
  export const calls = atom<number>(1250);
  export const mode = atom<"FPS" | "Histogram">("Histogram");
  export const openedMenu = atom<"settings" | "benchmark" | undefined>(
    undefined,
  );
  export const errorMessage = atom<string | undefined>(undefined);
  export const isRunning = atom<boolean>(false);
  export const progress = atom<number | undefined>(undefined);
  export const status = atom<string | undefined>(undefined);
  export const data = atom<GraphData | undefined>(undefined);
  export const results = atom<Result[] | undefined>(undefined);
  export const microprofilerStats = atom<
    Map<string, Stats<ProfileLog>> | undefined
  >(undefined);
  export const highlightedX = atom<{ [key: string]: number }>({});
  export const profileLogs = atom<Map<string, ProfileLog[]> | undefined>(
    undefined,
  );
}
