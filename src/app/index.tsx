import React, { useEffect } from "@rbxts/react";
import Sidebar from "./sidebar";
import { DropShadowFrame, Splitter } from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";
import { GetBenchmarkableModules, GetBenchmarkName } from "benchmark";
import { Workspace } from "@rbxts/services";
import { TITLE_HEIGHT } from "configurations";
import Settings from "./settings";
import { Settings as SettingsNamespace, useSetting } from "settings";
import { useAtom } from "@rbxts/react-charm";
import { Atoms } from "./atoms";
import {
  pinMicroProfiler,
  refreshBenchmarks,
  selectBenchmark,
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
          game
            .GetService("ScriptEditorService")
            .OpenScriptDocumentAsync(clonedTemplate as LuaSourceContainer);
        }}
      />
    </DropShadowFrame>
  );
}

export function App() {
  const [sideBarAlpha, setSideBarAlpha] = useSetting("SideBarPaneAlpha");

  const openedMenu = useAtom(Atoms.openedMenu);
  const openedBenchmark = useAtom(Atoms.openedBenchmark);
  const errorMessage = useAtom(Atoms.errorMessage);
  const results = useAtom(Atoms.results);

  useEffect(() => {
    Atoms.availableBenchmarks(GetBenchmarkableModules());
  }, []);

  useEffect(() => {
    if (!results) return;

    const highlighted: { [key: string]: number } = {};
    for (const [, value] of pairs(results)) {
      highlighted[value.Name] = value.NumberData.find(
        (data) => data[0] === SettingsNamespace.GetSetting("PrioritizedStat"),
      )![1] as number;
    }

    Atoms.highlightedX(highlighted);
  }, [results]);

  const showBenchmarkView =
    openedMenu === "benchmark" && openedBenchmark !== undefined;

  return (
    <Splitter
      Size={new UDim2(1, 0, 1, 0)}
      FillDirection={Enum.FillDirection.Horizontal}
      Alpha={sideBarAlpha}
      OnChanged={setSideBarAlpha}
    >
      {{
        Side0: <BenchmarkPicker />,
        Side1: (
          <frame
            BackgroundColor3={COLORS.Background}
            Size={new UDim2(1, 0, 1, 0)}
          >
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
            ) : showBenchmarkView ? (
              <DataFrame onMicroProfilerClick={pinMicroProfiler} />
            ) : undefined}
          </frame>
        ),
      }}
    </Splitter>
  );
}

export default App;
