import { BenchmarkLibrary } from "./lib";

/* Types */
export interface FormattedBenchmarkScript<T> {
  /* either one */
  Parameter?: () => T;
  ParameterGenerator?: () => T;

  Functions?: {
    [name: string]: (lib: typeof BenchmarkLibrary, arg: T) => void;
  };
  Name?: string;

  /* Before + After functions */
  BeforeAll?: () => void;
  BeforeEach?: () => void;
  AfterEach?: () => void;
  AfterAll?: () => void;
}
export type ProfileLog = {
  time: number;
  name: string | false;
}[]; /* false represents end */
export interface Stats<T> {
  Avg: T;
  "50%": T;
  "90%": T;
  "10%": T;
  Min: T;
  Max: T;
  StdDev: T;
  Mode: T;
  MAD: T;
}
