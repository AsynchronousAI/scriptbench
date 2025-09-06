import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Slider } from "@rbxts/ui-labs";
import Graph, { GraphProps } from "app/graph";
import { GraphAtoms } from "app/graph/atoms";
const controls = {
  Zoom: Slider(1, 1, 5, 0.1),
  Scroll: 0,
};

const story = {
  react: React,
  reactRoblox: ReactRoblox,
  controls: controls,
  story: (input: { controls: typeof controls }) => {
    GraphAtoms.focusedX(input.controls.Scroll);
    GraphAtoms.zoom(input.controls.Zoom as unknown as number);

    const component = (
      <Graph
        Data={[
          {
            name: "apple",
            data: {
              1: 19,
              2: 19,
              3: 20,
              4: 22,
              5: 22,
              6: 21,
              7: 24,
              8: 25,
              9: 24,
              10: 25,
              11: 24,
              12: 24,
              13: 24,
              14: 21,
              15: 19,
              16: 18,
              17: 16,
              18: 17,
              19: 15,
              20: 13,
              21: 27,
              22: 15,
              23: 15,
              24: 13,
              25: 12,
              26: 12,
              27: 11,
              28: 11,
              29: 10,
              30: 10,
              31: 9,
              32: 12,
              33: 12,
              34: 10,
              35: 11,
            },
            highlightedX: 7.8,
          },
        ]}
      />
    );
    return component;
  },
};

export = story;
