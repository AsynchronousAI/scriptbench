import React, { useMemo } from "@rbxts/react";
import { BinData } from "benchmark/benchmark";
import { useAtom } from "@rbxts/react-charm";
import { ProgressBar, Splitter } from "@rbxts/studiocomponents-react2";
import { Atoms } from "./atoms";
import { TITLE_HEIGHT, VERSION_NUMBER } from "configurations";
import Results from "./results";
import MicroProfiler from "./microprofiler";
import Graph, { GraphingMode } from "./graph";
import { ToMicroprofilerData } from "benchmark/profiler";
import { COLORS } from "colors";
import { useSetting } from "settings";
import StartPanel from "./start-panel";

const WATERMARK_TEXT = `Scriptbench v${VERSION_NUMBER}, © bitsplicer ${os.date("%Y")}`;

function StartOrProgress() {
  const isRunning = useAtom(Atoms.isRunning);
  const progress = useAtom(Atoms.progress);
  const status = useAtom(Atoms.status);

  return (
    <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
      {isRunning ? (
        <frame
          Size={new UDim2(0.6, 0, 0, 48)}
          AnchorPoint={new Vector2(0.5, 0.5)}
          Position={new UDim2(0.5, 0, 0.5, 0)}
          BackgroundTransparency={1}
        >
          <ProgressBar
            Value={progress ?? 0}
            Max={100}
            Formatter={() => status ?? ""}
            Size={new UDim2(1, 0, 1, 0)}
          />
        </frame>
      ) : (
        <frame
          Size={new UDim2(0.45, 0, 0.5, 0)}
          AnchorPoint={new Vector2(0.5, 0.5)}
          Position={new UDim2(0.5, 0, 0.5, 0)}
          BackgroundTransparency={1}
        >
          <StartPanel />
        </frame>
      )}
    </frame>
  );
}

export function DataFrame(props: {
  onMicroProfilerClick?: (parentName: string, name: string) => void;
}) {
  const [alpha1, setAlpha1] = useSetting("BottomPaneAlpha");
  const [alpha2, setAlpha2] = useSetting("RightPaneAlpha");
  const [rendering] = useSetting("Rendering");
  const [outlierDivider] = useSetting("OutlierDivider");
  const [filterOutliers] = useSetting("FilterOutliers");

  const results = useAtom(Atoms.results);
  const rawData = useAtom(Atoms.data);
  const microprofilerStats = useAtom(Atoms.microprofilerStats);
  const isRunning = useAtom(Atoms.isRunning);
  const lastRunCallCount = useAtom(Atoms.lastRunCallCount);
  const calls = useAtom(Atoms.calls);

  const hasResults = results && results.size() > 0;
  const hasMicroStats = microprofilerStats && microprofilerStats.size() > 0;

  const callCount = lastRunCallCount ?? calls;
  const graphData = useMemo(() => {
    if (!rawData) return rawData;
    const divider = math.max(1, outlierDivider);
    const threshold = math.max(1, math.floor(callCount / divider));
    return BinData(rawData, threshold, filterOutliers);
  }, [rawData, callCount, outlierDivider, filterOutliers]);

  if (!hasResults) {
    return (
      <>
        <StartOrProgress />
        <textlabel
          Text={WATERMARK_TEXT}
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

  return (
    <>
      <Splitter
        Size={new UDim2(1, 0, 1 - TITLE_HEIGHT * 2, 0)}
        Position={new UDim2(0, 0, TITLE_HEIGHT * 2, 0)}
        Alpha={alpha2}
        FillDirection={Enum.FillDirection.Horizontal}
        OnChanged={setAlpha2}
      >
        {{
          Side0: <Results Results={results} />,
          Side1: (
            <Splitter
              Alpha={alpha1}
              FillDirection={Enum.FillDirection.Vertical}
              OnChanged={setAlpha1}
            >
              {{
                Side0: graphData && (
                  <Graph
                    Data={graphData}
                    XPrefix="µs"
                    Mode={GraphingMode[rendering]}
                  />
                ),
                Side1: isRunning ? (
                  <StartOrProgress />
                ) : hasMicroStats ? (
                  <MicroProfiler
                    Results={ToMicroprofilerData(results)}
                    MicroProfiler={microprofilerStats}
                    OnClick={props.onMicroProfilerClick}
                  />
                ) : (
                  <StartOrProgress />
                ),
              }}
            </Splitter>
          ),
        }}
      </Splitter>

      <textlabel
        Text={WATERMARK_TEXT}
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

export default DataFrame;
