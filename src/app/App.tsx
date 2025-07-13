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
} from "benchmark";

const SIDEBAR_WIDTH = 0.15;
const RESULTS_WIDTH = 0.2;

export function App() {
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

  const startBenchmark = () => {
    setProgress(0);

    const result = BenchmarkAll(
      currentBenchmark!,
      calls,
      (count, status) => {
        setProgress(math.map(count, 0, calls, 0, 100));
        setProgressStatus(status);
      },
      setErrorMessage,
    );

    print(result);
    setData(result as unknown as GraphData);
    setResults(ComputeResults(result as unknown as GraphData));
  };

  useMemo(() => {
    setBenchmarks(GetBenchmarkableModules());
  }, []);

  useEffect(() => {
    if (!results) return;

    let highlightedXs: { [key: string]: number } = {};
    for (const [key, value] of pairs(results)) {
      highlightedXs[value.Name] = value.NumberData.find(
        (data) => data[0] === "50%",
      )![1] as number;
    }

    setHighlightedX(highlightedXs);
  }, [results]);

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
            setCurrentBenchmark(
              benchmarks.find(
                (benchmark) => GetBenchmarkName(benchmark) === name,
              ),
            );
            setData(undefined);
            setProgress(0);
            setErrorMessage(undefined);
          }}
          OnRefresh={() => {
            setBenchmarks(GetBenchmarkableModules());
            setData(undefined);
            setProgress(0);
            setErrorMessage(undefined);
          }}
        />
      </DropShadowFrame>

      <frame
        Size={new UDim2(1 - SIDEBAR_WIDTH, 0, 1, 0)}
        BackgroundTransparency={1}
      >
        <textlabel
          Text={`<b>${GetBenchmarkName(currentBenchmark)}</b>   ${currentBenchmark?.Name ?? ""}`}
          RichText
          Position={new UDim2(0.03, 0, 0.01, 0)}
          Size={new UDim2(0.5, 0, 0.035, 0)}
          BackgroundTransparency={1}
          TextScaled
          Font={Enum.Font.BuilderSans}
          TextXAlignment={"Left"}
          TextColor3={COLORS.FocusText}
          ZIndex={2}
        />

        {errorMessage ? (
          <textlabel
            Text={`Error: ${errorMessage}`}
            RichText
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Size={new UDim2(0.5, 0, 0.035, 0)}
            BackgroundTransparency={1}
            AnchorPoint={new Vector2(0.5, 0.5)}
            TextScaled
            Font={Enum.Font.BuilderSans}
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
              Size={new UDim2(1 - RESULTS_WIDTH, 0, 1, 0)}
              BackgroundTransparency={1}
              Position={new UDim2(RESULTS_WIDTH, 0, 0, 0)}
            >
              <Graph Data={data} XPrefix="µs" HighlightedX={highlightedX} />
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
              Size={new UDim2(0.2, 0, 0.025, 0)}
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
