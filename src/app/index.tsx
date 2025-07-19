import React, { useEffect, useMemo, useState } from "@rbxts/react";
import Graph, { GraphData } from "app/graph";
import Sidebar from "./sidebar";
import {
  DropShadowFrame,
  MainButton,
  ProgressBar,
  NumericInput,
  Splitter,
} from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";
import Results, { Result } from "./results";
import BenchmarkAll, {
  ComputeResults,
  FilterMap,
  GetBenchmarkableModules,
  GetBenchmarkName,
  ProfileLog,
  Stats,
  ToMicroprofilerData,
} from "benchmark";
import { Workspace } from "@rbxts/services";
import MicroProfiler from "./microprofiler";
import {
  Configuration,
  MICROPROFILER_HEIGHT,
  RESULTS_WIDTH,
  SIDEBAR_WIDTH,
  TITLE_HEIGHT,
  VERSION_NUMBER,
} from "configurations";
import Settings from "./settings";

// Separate state interfaces for better organization
interface UIState {
  openedMenu: "settings" | "benchmark" | undefined;
  errorMessage?: string;
}

interface BenchmarkState {
  available: ModuleScript[];
  current?: ModuleScript;
  calls: number;
}

interface BenchmarkExecution {
  isRunning: boolean;
  progress?: number;
  status?: string;
}

interface BenchmarkResults {
  data?: GraphData;
  results?: Result[];
  profileLogs?: Map<string, Stats<ProfileLog>>;
  highlightedX: { [key: string]: number };
}

function DataFrame(props: {
  results: BenchmarkResults;
  onAlphaChange?: (alpha1: number, alpha2: number) => void;
}) {
  const [alpha1, setAlpha1] = useState(1 - RESULTS_WIDTH);
  const [alpha2, setAlpha2] = useState(MICROPROFILER_HEIGHT);

  return (
    <>
      <Splitter
        Size={new UDim2(1, 0, 1 - TITLE_HEIGHT * 1.5, 0)}
        Position={new UDim2(0, 0, TITLE_HEIGHT * 1.5, 0)}
        Alpha={alpha2}
        FillDirection={Enum.FillDirection.Horizontal}
        OnChanged={setAlpha2}
      >
        {{
          Side0: <Results Results={props.results.results!} />,
          Side1: (
            <Splitter
              key="Side1"
              Alpha={alpha1}
              FillDirection={Enum.FillDirection.Vertical}
              OnChanged={setAlpha1}
            >
              {{
                Side0: (
                  <Graph
                    Data={props.results.data!}
                    XPrefix="µs"
                    HighlightedX={props.results.highlightedX}
                  />
                ),
                Side1: (
                  <MicroProfiler
                    Results={ToMicroprofilerData(props.results.results!)}
                    MicroProfiler={props.results.profileLogs}
                  />
                ),
              }}
            </Splitter>
          ),
        }}
      </Splitter>

      {/* Watermark */}
      <textlabel
        Text={`Scriptbench v${VERSION_NUMBER}, © bitsplicer ${os.date("%Y")}`}
        Size={new UDim2(0.2, 0, 0.025, 0)}
        Position={new UDim2(0.795, 0, 0.975, 0)}
        BackgroundTransparency={1}
        TextScaled
        TextColor3={COLORS.FocusText}
        Font={"BuilderSansBold"}
      />
    </>
  );
}

export function App() {
  // Separated state management
  const [uiState, setUIState] = useState<UIState>({
    openedMenu: undefined,
    errorMessage: undefined,
  });

  const [benchmarkState, setBenchmarkState] = useState<BenchmarkState>({
    available: [],
    current: undefined,
    calls: 1250,
  });

  const [execution, setExecution] = useState<BenchmarkExecution>({
    isRunning: false,
    progress: undefined,
    status: undefined,
  });

  const [results, setResults] = useState<BenchmarkResults>({
    data: undefined,
    results: undefined,
    profileLogs: undefined,
    highlightedX: {},
  });

  const [sideBarAlpha, setSideBarAlpha] = useState(SIDEBAR_WIDTH);

  // Helper functions for state management
  const clearResults = () => {
    setResults({
      data: undefined,
      results: undefined,
      profileLogs: undefined,
      highlightedX: {},
    });
    setUIState((prev) => ({ ...prev, errorMessage: undefined }));
  };

  const clearExecution = () => {
    setExecution({
      isRunning: false,
      progress: undefined,
      status: undefined,
    });
  };

  const selectBenchmark = (benchmark: ModuleScript) => {
    setBenchmarkState((prev) => ({ ...prev, current: benchmark }));
    setUIState((prev) => ({ ...prev, openedMenu: "benchmark" }));
    clearResults(); // Clear previous results when selecting new benchmark
    clearExecution();
  };

  const refreshBenchmarks = () => {
    const newBenchmarks = GetBenchmarkableModules();
    setBenchmarkState((prev) => ({
      ...prev,
      available: newBenchmarks,
      current:
        prev.current && newBenchmarks.includes(prev.current)
          ? prev.current
          : undefined,
    }));
    setUIState((prev) => ({ ...prev, openedMenu: undefined }));
    clearResults(); // Clear results on refresh
    clearExecution();
  };

  /** Functions */
  const startBenchmark = () => {
    if (!benchmarkState.current) return;

    clearResults();
    setExecution({ isRunning: true, progress: 0 });

    const [result, profileLogs] = BenchmarkAll(
      benchmarkState.current,
      benchmarkState.calls,
      (count, status) => {
        setExecution((prev) => ({
          ...prev,
          progress: math.map(count, 0, benchmarkState.calls, 0, 100),
          status,
        }));
      },
      (err) => {
        setUIState((prev) => ({ ...prev, errorMessage: err }));
        clearExecution();
      },
    );

    const filteredResults = FilterMap(
      result as unknown as GraphData,
      benchmarkState.calls / 250,
    );

    const computedResults = ComputeResults(
      Configuration.ComputeStatsFiltered
        ? filteredResults
        : (result as unknown as GraphData),
    );

    setResults({
      data: filteredResults,
      results: computedResults,
      profileLogs,
      highlightedX: {}, // Will be computed in useEffect
    });

    clearExecution();
  };

  /** Effects */
  useMemo(() => {
    setBenchmarkState((prev) => ({
      ...prev,
      available: GetBenchmarkableModules(),
    }));
  }, []);

  useEffect(() => {
    if (!results.results) return;

    let highlightedXs: { [key: string]: number } = {};
    for (const [key, value] of pairs(results.results)) {
      highlightedXs[value.Name] = value.NumberData.find(
        (data) => data[0] === Configuration.PrioritizedStat,
      )![1] as number;
    }

    setResults((prev) => ({ ...prev, highlightedX: highlightedXs }));
  }, [results.results]);

  /** UI */
  return (
    <Splitter
      Size={new UDim2(1, 0, 1, 0)}
      FillDirection={Enum.FillDirection.Horizontal}
      Alpha={sideBarAlpha}
      OnChanged={setSideBarAlpha}
    >
      {{
        /* Sidebar */
        Side0: (
          <DropShadowFrame Size={new UDim2(1, 0, 1, 0)} ZIndex={2}>
            <Sidebar
              Benchmarks={benchmarkState.available.map((benchmark) =>
                GetBenchmarkName(benchmark),
              )}
              OnSelection={(name) => {
                const benchmark = benchmarkState.available.find(
                  (benchmark) => GetBenchmarkName(benchmark) === name,
                );
                if (benchmark) {
                  selectBenchmark(benchmark);
                }
              }}
              OnRefresh={refreshBenchmarks}
              ToggleSettings={() => {
                setUIState((prev) => ({
                  ...prev,
                  openedMenu:
                    prev.openedMenu === "settings" ? undefined : "settings",
                }));
              }}
              SettingsOpen={uiState.openedMenu === "settings"}
              OnNew={() => {
                const Selection = game.FindFirstChildOfClass("Selection")!;
                const clonedTemplate = script
                  .FindFirstAncestorOfClass("Script")! /* index.server.ts */
                  .FindFirstChild("tests") /* src/tests */
                  ?.FindFirstChild(
                    "Template.bench",
                  )! /* src/tests/Template.bench */
                  .Clone()!;
                clonedTemplate.Parent = Selection.Get()[0] || Workspace;
                Selection.Set([clonedTemplate]);
              }}
            />
          </DropShadowFrame>
        ),

        /* Main frame */
        Side1: (
          <frame
            BackgroundColor3={COLORS.Background}
            Size={new UDim2(1, 0, 1, 0)}
          >
            {/* Title */}
            <textlabel
              Text={
                uiState.openedMenu === "settings"
                  ? "<b>Settings</b>"
                  : uiState.openedMenu === "benchmark"
                    ? `<b>${GetBenchmarkName(benchmarkState.current)}</b>   ${benchmarkState.current?.Name ?? ""}`
                    : "<b>No benchmark selected</b>"
              }
              RichText
              Position={new UDim2(0.03, 0, 0.015, 0)}
              Size={new UDim2(0.5, 0, TITLE_HEIGHT, 0)}
              TextScaled
              Font={Enum.Font.BuilderSans}
              BackgroundTransparency={1}
              TextXAlignment={"Left"}
              TextColor3={COLORS.FocusText}
              ZIndex={2}
            />

            {/* Content */}
            {uiState.openedMenu === "settings" ? (
              <Settings />
            ) : uiState.errorMessage ? (
              <textlabel
                Text={`Error: ${uiState.errorMessage}`}
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
            ) : results.data &&
              benchmarkState.current &&
              uiState.openedMenu === "benchmark" ? (
              <DataFrame results={results} />
            ) : execution.isRunning && execution.progress !== undefined ? (
              <ProgressBar
                Value={execution.progress}
                Max={100}
                Formatter={() => execution.status ?? ""}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Size={new UDim2(0.75, 0, 0.05, 0)}
              />
            ) : benchmarkState.current && uiState.openedMenu === "benchmark" ? (
              <>
                <MainButton
                  Text="Start Benchmark"
                  Position={new UDim2(0.5, 0, 0.5, 0)}
                  AnchorPoint={new Vector2(0.5, 0.5)}
                  Size={new UDim2(0.2, 0, 0.05, 0)}
                  OnActivated={startBenchmark}
                />
                <NumericInput
                  Position={new UDim2(0.5, 0, 0.575, 0)}
                  Size={new UDim2(0.2, 0, 0.05, 0)}
                  AnchorPoint={new Vector2(0.5, 0.5)}
                  Value={benchmarkState.calls}
                  OnValidChanged={(calls) =>
                    setBenchmarkState((prev) => ({ ...prev, calls }))
                  }
                  Arrows
                  Slider={false}
                />
              </>
            ) : (
              <></>
            )}
          </frame>
        ),
      }}
    </Splitter>
  );
}

export default App;
