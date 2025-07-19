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

type UIState = {
  openedMenu: "settings" | "benchmark" | undefined;
  currentBenchmark?: ModuleScript;
  benchmarks: ModuleScript[];
  data?: GraphData;
  progress?: number;
  calls: number;
  progressStatus?: string;
  results?: Result[];
  highlightedX: { [key: string]: number };
  errorMessage?: string;
  profileLogs?: Map<string, Stats<ProfileLog>>;
};

function DataFrame(props: UIState) {
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
          Side0: <Results Results={props.results!} />,
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
                    Data={props.data!}
                    XPrefix="µs"
                    HighlightedX={props.highlightedX}
                  />
                ),
                Side1: (
                  <MicroProfiler
                    Results={ToMicroprofilerData(props.results!)}
                    MicroProfiler={props.profileLogs}
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
  const [uiState, setUiState] = useState<UIState>({
    openedMenu: undefined,
    currentBenchmark: undefined,
    benchmarks: [],
    data: undefined,
    progress: undefined,
    calls: 1250,
    progressStatus: undefined,
    results: undefined,
    highlightedX: {},
    errorMessage: undefined,
    profileLogs: undefined,
  });
  const [sideBarAlpha, setSideBarAlpha] = useState(SIDEBAR_WIDTH);

  const updateUiState = (patch: Partial<UIState>) =>
    setUiState((prev) => ({ ...prev, ...patch }));

  /** Functions */
  const startBenchmark = () => {
    updateUiState({ progress: 0 });

    const [result, profileLogs] = BenchmarkAll(
      uiState.currentBenchmark!,
      uiState.calls,
      (count, status) => {
        updateUiState({
          progress: math.map(count, 0, uiState.calls, 0, 100),
          progressStatus: status,
        });
      },
      (err) => updateUiState({ errorMessage: err }),
    );

    const filteredResults = FilterMap(
      result as unknown as GraphData,
      uiState.calls / 250,
    );

    updateUiState({
      profileLogs,
      data: filteredResults,
      results: ComputeResults(
        Configuration.ComputeStatsFiltered
          ? filteredResults
          : (result as unknown as GraphData),
      ),
    });
  };

  const closeCurrentPage = () => {
    updateUiState({
      openedMenu: undefined,
      data: undefined,
      progress: 0,
      errorMessage: undefined,
    });
  };

  /** Events/Memos */
  useMemo(() => {
    updateUiState({ benchmarks: GetBenchmarkableModules() });
  }, []);

  useEffect(() => {
    if (!uiState.results) return;

    let highlightedXs: { [key: string]: number } = {};
    for (const [key, value] of pairs(uiState.results)) {
      highlightedXs[value.Name] = value.NumberData.find(
        (data) => data[0] === Configuration.PrioritizedStat,
      )![1] as number;
    }

    updateUiState({ highlightedX: highlightedXs });
  }, [uiState.results]);

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
              Benchmarks={uiState.benchmarks.map((benchmark) =>
                GetBenchmarkName(benchmark),
              )}
              OnSelection={(name) => {
                closeCurrentPage();
                updateUiState({
                  currentBenchmark: uiState.benchmarks.find(
                    (benchmark) => GetBenchmarkName(benchmark) === name,
                  ),
                  openedMenu: "benchmark",
                });
              }}
              OnRefresh={() => {
                closeCurrentPage();
                updateUiState({ benchmarks: GetBenchmarkableModules() });
              }}
              ToggleSettings={() => {
                closeCurrentPage();
                updateUiState({
                  openedMenu:
                    uiState.openedMenu === "settings" ? undefined : "settings",
                });
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
                  : `<b>${GetBenchmarkName(uiState.currentBenchmark)}</b>   ${uiState.currentBenchmark?.Name ?? ""}`
              }
              RichText
              Position={new UDim2(0.03, 0, 0.01, 0)}
              Size={new UDim2(0.5, 0, TITLE_HEIGHT, 0)}
              TextScaled
              Font={Enum.Font.BuilderSans}
              BackgroundTransparency={1}
              TextXAlignment={"Left"}
              TextColor3={COLORS.FocusText}
              ZIndex={2}
            />

            {/* Settings */}
            {uiState.openedMenu === "settings" /* Settings menu */ ? (
              <Settings />
            ) : uiState.errorMessage /* Error message */ ? (
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
            ) : uiState.data /* Show the results */ ? (
              <DataFrame {...uiState} />
            ) : uiState.progress /* Result progress */ ? (
              <ProgressBar
                Value={uiState.progress}
                Max={100}
                Formatter={() => uiState.progressStatus ?? ""}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Size={new UDim2(0.75, 0, 0.05, 0)}
              />
            ) : uiState.currentBenchmark /* Provide options */ ? (
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
                  Value={uiState.calls}
                  OnValidChanged={(calls) => updateUiState({ calls })}
                  Arrows
                  Slider={false}
                />
              </>
            ) : (
              /* Nothing to show..? */
              <></>
            )}
          </frame>
        ),
      }}
    </Splitter>
  );
}

export default App;
