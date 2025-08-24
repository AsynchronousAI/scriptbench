import { ProfileLog } from "./types";

export namespace BenchmarkLibrary {
  const clock = os.clock;
  export let ProfileLog: ProfileLog[] = [];

  const addNewProfileLogEntry = (name: string | false) => {
    const time = clock();
    const latestEntry = ProfileLog[ProfileLog.size() - 1];

    if (!latestEntry) {
      ProfileLog.push([
        {
          time,
          name,
        },
      ]);
    } else {
      latestEntry.push({
        time,
        name,
      });
    }
  };

  export const profilebegin = (name: string) => addNewProfileLogEntry(name);
  export const profileend = () => addNewProfileLogEntry(false);

  /* Benchmarker lib format */
  export const Begin = (name: string) => addNewProfileLogEntry(name);
  export const End = () => addNewProfileLogEntry(false);
}
