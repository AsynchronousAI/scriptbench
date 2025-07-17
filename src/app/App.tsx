import React, { useEffect, useMemo, useState } from "@rbxts/react";
import Graph, { GraphData } from "graph";
import Sidebar from "./sidebar";
import {
  DropShadowFrame,
  MainButton,
  ProgressBar,
  NumericInput,
} from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";
import Results, { Result } from "./results";
import BenchmarkAll, {
  ComputeResults,
  GetBenchmarkableModules,
  GetBenchmarkName,
  ProfileLog,
  Stats,
  ToMicroprofilerData,
} from "benchmark";
import { Workspace } from "@rbxts/services";
import MicroProfiler from "./microprofiler";
import { Object } from "@rbxts/luau-polyfill";
import { Configuration } from "configurations";
import Settings from "./settings";

const SIDEBAR_WIDTH = 0.15;
const RESULTS_WIDTH = 0.2;
const MICROPROFILER_HEIGHT = 0.2;
const MIN_CALLS = 1000; /* I highly reccomend you **NOT** to reduce this */

export function App() {
  /** States */
  const [currentBenchmark, setCurrentBenchmark] = useState<
    ModuleScript | undefined
  >(undefined);
  const [benchmarks, setBenchmarks] = useState<ModuleScript[]>([]);
  const [data, setData] = useState<GraphData | undefined>(undefined);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [calls, setCalls] = useState<number>(10_000);
  const [progressStatus, setProgressStatus] = useState<string | undefined>(
    undefined,
  );
  const [results, setResults] = useState<Result[] | undefined>(undefined);
  const [highlightedX, setHighlightedX] = useState<{ [key: string]: number }>(
    {},
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [profileLogs, setProfileLogs] =
    useState<Map<string, Stats<ProfileLog>>>();
  const [settingsOpen, setSettingsOpen] = useState(false);

  /** Functions */
  const startBenchmark = () => {
    setProgress(0);

    /*if (calls < MIN_CALLS) {
      setErrorMessage(`Minimum calls is ${MIN_CALLS}`);
      return;
    }*/

    const [result, profileLogs] = BenchmarkAll(
      currentBenchmark!,
      calls,
      (count, status) => {
        setProgress(math.map(count, 0, calls, 0, 100));
        setProgressStatus(status);
      },
      setErrorMessage,
    );

    setProfileLogs(profileLogs);
    setData(result as unknown as GraphData);
    setResults(ComputeResults(result as unknown as GraphData));
  };
  const closeCurrentPage = () => {
    setSettingsOpen(false);
    setData(undefined);
    setProgress(0);
    setErrorMessage(undefined);
  };

  /** Events/Memos */
  useMemo(() => {
    setBenchmarks(GetBenchmarkableModules());
  }, []);
  useEffect(() => {
    if (!results) return;

    let highlightedXs: { [key: string]: number } = {};
    for (const [key, value] of pairs(results)) {
      highlightedXs[value.Name] = value.NumberData.find(
        (data) => data[0] === Configuration.PrioritizedStat,
      )![1] as number;
    }

    setHighlightedX(highlightedXs);
  }, [results]);

  /** UI */
  return (
    <frame
      Size={new UDim2(1, 0, 1, 0)}
      BackgroundColor3={COLORS.Background}
      BorderMode={"Inset"}
    >
      <uilistlayout FillDirection={"Horizontal"} />
      <DropShadowFrame Size={new UDim2(SIDEBAR_WIDTH, 5, 1, 0)} ZIndex={2}>
        <Sidebar
          Benchmarks={benchmarks.map((benchmark) =>
            GetBenchmarkName(benchmark),
          )}
          OnSelection={(name) => {
            closeCurrentPage();
            setCurrentBenchmark(
              benchmarks.find(
                (benchmark) => GetBenchmarkName(benchmark) === name,
              ),
            );
          }}
          OnRefresh={() => {
            closeCurrentPage();
            setBenchmarks(GetBenchmarkableModules());
          }}
          ToggleSettings={() => {
            closeCurrentPage();
            setSettingsOpen((x) => !x);
          }}
          SettingsOpen={settingsOpen}
          OnNew={() => {
            const Selection = game.FindFirstChildOfClass("Selection")!;
            const clonedTemplate = script.Parent?.Parent!.FindFirstChild(
              "tests",
            )
              ?.FindFirstChild("Template.bench")!
              .Clone()!; /* not at all pretty */

            clonedTemplate.Parent = Selection.Get()[0] || Workspace;
            Selection.Set([clonedTemplate]);
          }}
        />
      </DropShadowFrame>

      <frame
        Size={new UDim2(1 - SIDEBAR_WIDTH, 0, 1, 0)}
        BackgroundTransparency={1}
      >
        {/* Title */}
        <textlabel
          Text={
            settingsOpen
              ? "<b>Settings</b>"
              : `<b>${GetBenchmarkName(currentBenchmark)}</b>   ${currentBenchmark?.Name ?? ""}`
          }
          RichText
          Position={new UDim2(0.03, 0, 0.01, 0)}
          Size={new UDim2(0.5, 0, 0.035, 0)}
          TextScaled
          Font={Enum.Font.BuilderSans}
          BackgroundTransparency={1}
          TextXAlignment={"Left"}
          TextColor3={COLORS.FocusText}
          ZIndex={2}
        />

        {/* Settings */}
        {settingsOpen ? (
          <Settings />
        ) : errorMessage /* Error */ ? (
          <textlabel
            Text={`Error: ${errorMessage}`}
            RichText
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Size={new UDim2(0.75, 0, 0.05, 0)}
            BackgroundTransparency={1}
            AnchorPoint={new Vector2(0.5, 0.5)}
            TextScaled
            Font={Enum.Font.Code}
            TextXAlignment={"Left"}
            TextColor3={COLORS.ErrorText}
            ZIndex={2}
          />
        ) : data /* Data exists, show it! */ ? (
          <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
            <frame
              Size={new UDim2(RESULTS_WIDTH, 0, 0.95, 0)}
              Position={new UDim2(0, 0, 0.05, 0)}
              BackgroundTransparency={1}
            >
              <Results Results={results!} />
            </frame>
            <frame
              Size={
                new UDim2(1 - RESULTS_WIDTH, 0, 1 - MICROPROFILER_HEIGHT, 0)
              }
              BackgroundTransparency={1}
              Position={new UDim2(RESULTS_WIDTH, 0, 0, 0)}
            >
              <Graph Data={data} XPrefix="µs" HighlightedX={highlightedX} />
            </frame>
            <frame
              Size={new UDim2(1 - RESULTS_WIDTH, 0, MICROPROFILER_HEIGHT, 0)}
              BackgroundTransparency={1}
              Position={
                new UDim2(RESULTS_WIDTH, 0, 1 - MICROPROFILER_HEIGHT, 0)
              }
            >
              <MicroProfiler
                Results={ToMicroprofilerData(results!)}
                MicroProfiler={profileLogs}
              />
            </frame>
          </frame>
        ) : progress /* Currently runnning benchmark */ ? (
          <ProgressBar
            Value={progress}
            Max={100}
            Formatter={() => progressStatus ?? ""}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Size={new UDim2(0.75, 0, 0.05, 0)}
          />
        ) : currentBenchmark ? (
          <>
            {/* Need to start */}
            <MainButton
              Text="Start Benchmark"
              Position={new UDim2(0.5, 0, 0.5, 0)}
              AnchorPoint={new Vector2(0.5, 0.5)}
              Size={new UDim2(0.2, 0, 0.05, 0)}
              OnActivated={() => {
                startBenchmark();
              }}
            />
            <NumericInput
              Position={new UDim2(0.5, 0, 0.575, 0)}
              Size={new UDim2(0.2, 0, 0.05, 0)}
              AnchorPoint={new Vector2(0.5, 0.5)}
              Value={calls}
              OnValidChanged={setCalls}
              Arrows
              Slider={false}
            />
          </>
        ) : (
          <></>
        )}
      </frame>
    </frame>
  );
}

export default App;
