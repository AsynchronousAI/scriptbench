import React, { useEffect, useMemo, useState } from "@rbxts/react";
import Graph, { GraphData } from "app/graph";
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
  FilterMap,
  GetBenchmarkableModules,
  GetBenchmarkName,
  ProfileLog,
  Stats,
  ToMicroprofilerData,
} from "benchmark";
import { Workspace } from "@rbxts/services";
import MicroProfiler from "./microprofiler";
import { Configuration } from "configurations";
import Settings from "./settings";

const SIDEBAR_WIDTH = 0.15;
const RESULTS_WIDTH = 0.2;
const MICROPROFILER_HEIGHT = 0.2;

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

export function App(props: {
  GetSetting?: (x: string) => void;
  SetSetting?: (x: string, y: string) => void;
}) {
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
    <frame
      Size={new UDim2(1, 0, 1, 0)}
      BackgroundColor3={COLORS.Background}
      BorderMode={"Inset"}
    >
      <uilistlayout FillDirection={"Horizontal"} />
      <DropShadowFrame Size={new UDim2(SIDEBAR_WIDTH, 5, 1, 0)} ZIndex={2}>
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
            const clonedTemplate = script.Parent?.Parent!.FindFirstChild(
              "tests",
            )
              ?.FindFirstChild("Template.bench")!
              .Clone()!;
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
            uiState.openedMenu === "settings"
              ? "<b>Settings</b>"
              : `<b>${GetBenchmarkName(uiState.currentBenchmark)}</b>   ${uiState.currentBenchmark?.Name ?? ""}`
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
        {uiState.openedMenu === "settings" ? (
          <Settings
            GetSetting={props.GetSetting}
            SetSetting={props.SetSetting}
          />
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
        ) : uiState.data ? (
          <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
            <frame
              Size={new UDim2(RESULTS_WIDTH, 0, 0.95, 0)}
              Position={new UDim2(0, 0, 0.05, 0)}
              BackgroundTransparency={1}
            >
              <Results Results={uiState.results!} />
            </frame>
            <frame
              Size={
                new UDim2(1 - RESULTS_WIDTH, 0, 1 - MICROPROFILER_HEIGHT, 0)
              }
              BackgroundTransparency={1}
              Position={new UDim2(RESULTS_WIDTH, 0, 0, 0)}
            >
              <Graph
                Data={uiState.data}
                XPrefix="µs"
                HighlightedX={uiState.highlightedX}
              />
            </frame>
            <frame
              Size={new UDim2(1 - RESULTS_WIDTH, 0, MICROPROFILER_HEIGHT, 0)}
              BackgroundTransparency={1}
              Position={
                new UDim2(RESULTS_WIDTH, 0, 1 - MICROPROFILER_HEIGHT, 0)
              }
            >
              <MicroProfiler
                Results={ToMicroprofilerData(uiState.results!)}
                MicroProfiler={uiState.profileLogs}
              />
            </frame>
          </frame>
        ) : uiState.progress ? (
          <ProgressBar
            Value={uiState.progress}
            Max={100}
            Formatter={() => uiState.progressStatus ?? ""}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Size={new UDim2(0.75, 0, 0.05, 0)}
          />
        ) : uiState.currentBenchmark ? (
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
          <></>
        )}
      </frame>
    </frame>
  );
}

export default App;
