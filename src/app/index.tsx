import React, { useEffect, useState } from "@rbxts/react";
import Sidebar from "./sidebar";
import {
  DropShadowFrame,
  MainButton,
  ProgressBar,
  NumericInput,
  Splitter,
  Dropdown,
} from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";
import { GetBenchmarkableModules, GetBenchmarkName } from "benchmark";
import { Workspace } from "@rbxts/services";
import { SIDEBAR_WIDTH, TITLE_HEIGHT } from "configurations";
import Settings from "./settings";
import { Settings as SettingsNamespace } from "settings";
import { useAtom } from "@rbxts/react-charm";
import { Atoms } from "./atoms";
import {
  pinMicroProfiler,
  refreshBenchmarks,
  selectBenchmark,
  startBenchmark,
} from "./actions";
import { DataFrame } from "./dataframe";

function BenchmarkPicker() {
  const availableBenchmarks = useAtom(Atoms.availableBenchmarks);
  const openedMenu = useAtom(Atoms.openedMenu);

  return (
    <DropShadowFrame Size={new UDim2(1, 0, 1, 0)} ZIndex={2}>
      <Sidebar
        Benchmarks={availableBenchmarks.map((benchmark) =>
          GetBenchmarkName(benchmark),
        )}
        OnSelection={(name) => {
          const benchmark = availableBenchmarks.find(
            (benchmark) => GetBenchmarkName(benchmark) === name,
          );
          if (benchmark) {
            selectBenchmark(benchmark);
          }
        }}
        OnRefresh={refreshBenchmarks}
        ToggleSettings={() => {
          Atoms.openedMenu((prev) =>
            prev === "settings" ? undefined : "settings",
          );
        }}
        SettingsOpen={openedMenu === "settings"}
        OnNew={() => {
          const Selection = game.FindFirstChildOfClass("Selection")!;
          const clonedTemplate = script
            .FindFirstAncestorOfClass("Script")! /* index.server.ts */
            .FindFirstChild("tests") /* src/tests */
            ?.FindFirstChild("Template.bench")! /* src/tests/Template.bench */
            .Clone()!;
          clonedTemplate.Parent = Selection.Get()[0] || Workspace;
          Selection.Set([clonedTemplate]);
        }}
      />
    </DropShadowFrame>
  );
}
function StartBenchmark() {
  const mode = useAtom(Atoms.mode);
  const calls = useAtom(Atoms.calls);

  return (
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
        Value={calls}
        OnValidChanged={(calls) => Atoms.calls(calls)}
        Arrows
        Slider={false}
      />
      {/*<Dropdown
        Position={new UDim2(0.5, 0, 0.65, 0)}
        Size={new UDim2(0.2, 0, 0.05, 0)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        SelectedItem={mode}
        OnItemSelected={(mode) => Atoms.mode(mode)}
        Items={["FPS", "Histogram"]}
      />*/}
    </>
  );
}
export function App() {
  const [sideBarAlpha, setSideBarAlpha] = useState(SIDEBAR_WIDTH);

  const openedMenu = useAtom(Atoms.openedMenu);
  const openedBenchmark = useAtom(Atoms.openedBenchmark);
  const errorMessage = useAtom(Atoms.errorMessage);
  const results = useAtom(Atoms.results);
  const isRunning = useAtom(Atoms.isRunning);
  const data = useAtom(Atoms.data);
  const status = useAtom(Atoms.status);
  const progress = useAtom(Atoms.progress);

  /** Effects */
  useEffect(() => {
    /* on init find available benchmarks */
    Atoms.availableBenchmarks(GetBenchmarkableModules());
  }, []);

  useEffect(() => {
    /* automatically load highlightX */
    if (!results) return;

    let highlightedXs: { [key: string]: number } = {};
    for (const [key, value] of pairs(results)) {
      if (value.IsMicroProfiler) continue;

      highlightedXs[value.Name] = value.NumberData.find(
        (data) => data[0] === SettingsNamespace.GetSetting("PrioritizedStat"),
      )![1] as number;
    }

    Atoms.highlightedX(highlightedXs);
  }, [results]);

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
        Side0: <BenchmarkPicker />,

        /* Main frame */
        Side1: (
          <frame
            BackgroundColor3={COLORS.Background}
            Size={new UDim2(1, 0, 1, 0)}
          >
            {/* Title */}
            <textlabel
              Text={
                openedMenu === "settings"
                  ? "<b>Settings</b>"
                  : openedMenu === "benchmark"
                    ? `<b>${GetBenchmarkName(openedBenchmark)}</b>   ${openedBenchmark?.Name ?? ""}`
                    : "<b>No benchmark selected</b>"
              }
              RichText
              Position={new UDim2(0.03, 0, TITLE_HEIGHT / 2, 0)}
              Size={new UDim2(0.5, 0, TITLE_HEIGHT, 0)}
              TextScaled
              Font={Enum.Font.BuilderSans}
              BackgroundTransparency={1}
              TextXAlignment={"Left"}
              TextColor3={COLORS.FocusText}
              ZIndex={2}
            />

            {/* Content */}
            {openedMenu === "settings" ? (
              <Settings />
            ) : errorMessage ? (
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
            ) : data && openedBenchmark && openedMenu === "benchmark" ? (
              <DataFrame onMicroProfilerClick={pinMicroProfiler} />
            ) : isRunning && progress !== undefined ? (
              <ProgressBar
                Value={progress}
                Max={100}
                Formatter={() => status ?? ""}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Size={new UDim2(0.75, 0, 0.05, 0)}
              />
            ) : openedBenchmark && openedMenu === "benchmark" ? (
              <StartBenchmark />
            ) : undefined}
          </frame>
        ),
      }}
    </Splitter>
  );
}

export default App;
