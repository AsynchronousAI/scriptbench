import React, { useState } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { Atoms } from "./atoms";
import {
  MICROPROFILER_HEIGHT,
  RESULTS_WIDTH,
  TITLE_HEIGHT,
  VERSION_NUMBER,
} from "configurations";
import { Splitter } from "@rbxts/studiocomponents-react2";
import Results from "./results";
import MicroProfiler from "./microprofiler";
import Graph from "./graph";
import { ToMicroprofilerData } from "benchmark/profiler";
import { COLORS } from "colors";

export function DataFrame(props: {
  onMicroProfilerClick?: (parentName: string, name: string) => void;
}) {
  const [alpha1, setAlpha1] = useState(1 - RESULTS_WIDTH);
  const [alpha2, setAlpha2] = useState(MICROPROFILER_HEIGHT);

  const results = useAtom(Atoms.results);
  const microprofilerStats = useAtom(Atoms.microprofilerStats);
  const data = useAtom(Atoms.data);
  const highlightedX = useAtom(Atoms.highlightedX);

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
          Side0: <Results Results={results!} />,
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
                    Data={data!}
                    XPrefix="µs"
                    HighlightedX={highlightedX}
                  />
                ),
                Side1: (
                  <MicroProfiler
                    Results={ToMicroprofilerData(results!)}
                    MicroProfiler={microprofilerStats}
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
