const precision = 5; /* 5 digits of precision compared to a second */
const requiredPrefix = ".bench";

interface FormattedBenchmarkScript<T> {
  ParameterGenerator: () => T;
  Functions: { [name: string]: (arg: T) => void };
}

export function GetBenchmarkableModules() {
  let validModules = [];
  for (const module of game.GetDescendants()) {
    if (!module.IsA("ModuleScript")) continue;
    if (
      module.Name.sub(module.Name.size() - requiredPrefix.size()) !==
      requiredPrefix
    )
      continue; /* does not match required suffix */

    validModules.push(module);
  }

  return validModules;
}
function Benchmark(
  requiredModule: FormattedBenchmarkScript<unknown>,
  use: string,
  calls: number,
) {
  /* benchmark a single case in a module */
  let recordedTimes = new Map<number, number>(); /* time taken to calls map */

  for (let count = 0; count++; count <= calls) {
    const parameter = requiredModule.ParameterGenerator();

    /* benchmark! */
    const start = tick();
    requiredModule.Functions[use](parameter);
    const end_ = tick();

    const elapsedTime =
      math.floor((end_ - start) * 10 ** precision) / 10 ** precision;

    /* record */
    const current = recordedTimes.get(elapsedTime) ?? 0;
    recordedTimes.set(elapsedTime, current + 1);
  }

  return recordedTimes;
}
export default function BenchmarkAll(module: ModuleScript, calls: number) {
  /* benchmark all cases of a module */
  let totalResults = new Map<string, Map<number, number>>();
  const requiredModule = require(module) as FormattedBenchmarkScript<unknown>;

  for (const [benchmarkName] of pairs(requiredModule.Functions)) {
    const results = Benchmark(requiredModule, benchmarkName as string, calls);
    totalResults.set(module.Name, results);
  }

  return totalResults;
}
