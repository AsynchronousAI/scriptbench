import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Choose, Slider } from "@rbxts/ui-labs";
import Graph, { GraphingMode } from "app/graph";
import { GraphAtoms } from "app/graph/atoms";
import { MockupGraphData } from "mockup";

const controls = {
  Zoom: Slider(1, 1, 5, 0.1),
  Scroll: 0,
  Mode: Choose(["Steps", "Lines", "Spline"]),
  Saturation: Slider(63, 0, 100, 1),
  Value: Slider(83, 0, 100, 1),
};

const story = {
  react: React,
  reactRoblox: ReactRoblox,
  controls: controls,
  story: (input: { controls: typeof controls }) => {
    const mode = input.controls.Mode as unknown as string;
    GraphAtoms.focusedX(input.controls.Scroll);
    GraphAtoms.zoom(input.controls.Zoom as unknown as number);

    const props = {
      Data: MockupGraphData,
    };
    return (
      <Graph
        {...props}
        Mode={
          mode === "Steps"
            ? GraphingMode.Steps
            : mode === "Lines"
              ? GraphingMode.Lines
              : GraphingMode.Spline
        }
      />
    );
  },
};

export = story;
