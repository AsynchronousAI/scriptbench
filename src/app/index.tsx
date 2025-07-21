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
import { COLORS, LightenColor } from "colors";
import Results, { Result } from "./results";
import BenchmarkAll, {
  ComputeResults,
  FilterMap,
  GetBenchmarkableModules,
  GetBenchmarkName,
  ProfileLog,
  ProfileLogStats,
  Stats,
  ToMicroprofilerData,
} from "benchmark";
import { Workspace } from "@rbxts/services";
import MicroProfiler from "./microprofiler";
import {
  MICROPROFILER_HEIGHT,
  RESULTS_WIDTH,
  SIDEBAR_WIDTH,
  TITLE_HEIGHT,
  VERSION_NUMBER,
} from "configurations";
import Settings from "./settings";
import { Settings as SettingsNamespace } from "settings";
import { Object } from "@rbxts/luau-polyfill";
import { GetKeyColor } from "./graph/computation";

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
  microprofilerStats?: Map<string, Stats<ProfileLog>>;
  highlightedX: { [key: string]: number };
  profileLogs?: Map<string, ProfileLog[]>;
}

function DataFrame(props: {
  results: BenchmarkResults;
  onAlphaChange?: (alpha1: number, alpha2: number) => void;
  onMicroProfilerClick?: (parentName: string, name: string) => void;
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
                    MicroProfiler={props.results.microprofilerStats}
                    OnClick={props.onMicroProfilerClick}
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
    microprofilerStats: undefined,
    profileLogs: undefined,
    highlightedX: {},
  });

  const [sideBarAlpha, setSideBarAlpha] = useState(SIDEBAR_WIDTH);

  // Helper functions for state management
  const clearResults = () => {
    setResults({
      data: undefined,
      results: undefined,
      microprofilerStats: undefined,
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

  const pinMicroProfiler = (parentName: string, name: string) => {
    const fullName = `${parentName} (${name})`;
    const isInResults = results.results?.some(
      (result) => result.Name === fullName,
    );

    if (isInResults) {
      setResults((prev) => {
        let filteredData = { ...prev.data! };
        delete filteredData[fullName];

        return {
          ...prev,
          results: prev.results!.filter((result) => result.Name !== fullName),
          data: FilterMap(
            filteredData,
            benchmarkState.calls /
              SettingsNamespace.GetSetting("OutlierDivider"),
          ),
        };
      });
      return;
    }

    /** convert Stats for ProfilerLog to just Stats<number> for the specific block */
    let micoprofilerStat: Partial<Stats<number>> = {};
    for (const stats of Object.values(results.microprofilerStats!)) {
      for (const [stat, microprofilerData] of Object.entries(stats)) {
        for (const item of Object.values(microprofilerData)) {
          if (item.name !== name) continue;
          micoprofilerStat[stat] = item.time;
        }
      }
    }

    /** create an object to add to the sidebar */
    const NumberData = Object.entries(micoprofilerStat);
    if (NumberData.size() === 0) return; /* nothing good to show */
    const newItem = {
      Name: fullName,
      Color: GetKeyColor(fullName)[0],
      Order: micoprofilerStat[SettingsNamespace.GetSetting("PrioritizedStat")],
      NumberData: Object.entries(micoprofilerStat),
      IsMicroProfiler: true,
    } as Result;

    /** create an object to add to the graph */
    const runTimeData = results.profileLogs!.get(parentName)!;

    /* the above variable will look like
      {
        name: 'Create', // we want it to only be `name` variable
        time: 123,
      }[/* first array is all the different calls of the run /][/* second array is all the runs /]

      we need to make it a frequency chart for just `name`:
      {
        1:2,
        2:3,
      }
    */

    /* step 1. merge all the test runs into one giant array */
    const mergedData: ProfileLog = [];
    for (const batch of runTimeData) {
      for (const run of batch) {
        mergedData.push(run);
      }
    }

    /* step 2. filter an array of just this datas times */
    const thisBlockData = mergedData.filter((log) => log.name === name);

    /* step 3. create a map of the frequency of each time */
    const thisBlockTimes = thisBlockData.map((log) => log.time);
    let newData: { [key: number]: number } = {};
    for (const time of thisBlockTimes) {
      newData[time] = (newData[time] || 0) + 1;
    }

    setResults((prev) => ({
      ...prev,
      results: [...prev.results!, newItem],
      data: FilterMap(
        { ...prev.data!, [fullName]: newData },
        benchmarkState.calls / SettingsNamespace.GetSetting("OutlierDivider"),
      ),
    }));
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
      benchmarkState.calls / SettingsNamespace.GetSetting("OutlierDivider"),
    );

    const computedResults = ComputeResults(
      SettingsNamespace.GetSetting("FilterOutliers")
        ? filteredResults
        : (result as unknown as GraphData),
    );

    const microprofilerStats = new Map<string, Stats<ProfileLog>>();
    for (const [key, value] of Object.entries(profileLogs!)) {
      microprofilerStats.set(key as string, ProfileLogStats(value));
    }

    setResults({
      data: filteredResults,
      results: computedResults,
      profileLogs: profileLogs!,
      microprofilerStats,
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
      if (value.IsMicroProfiler) continue;

      highlightedXs[value.Name] = value.NumberData.find(
        (data) => data[0] === SettingsNamespace.GetSetting("PrioritizedStat"),
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
              <DataFrame
                results={results}
                onMicroProfilerClick={pinMicroProfiler}
              />
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
