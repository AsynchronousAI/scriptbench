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
        Data={{
          apple: {
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
          banana: {
            1: 3,
            2: 2,
            3: 1,
            4: 0,
            5: 0,
            6: 1,
            7: 3,
            8: 4,
            9: 4,
            10: 4,
            11: 1,
            12: 1,
            13: 1,
            14: 5,
            15: 5,
            16: 5,
            17: 5,
            18: 3,
            19: 5,
            20: 6,
            21: 7,
            22: 6,
            23: 8,
            24: 6,
            25: 7,
            26: 18,
            27: 9,
            28: 8,
            29: 8,
            30: 7,
            31: 5,
            32: 5,
            33: 3,
            34: 4,
            35: 3,
          },
          carrot: {
            1: 0,
            2: 1,
            3: 2,
            4: 4,
            5: 2,
            6: 1,
            7: 1,
            8: 2,
            9: 3,
            10: 9,
            11: 10,
            12: 11,
            13: 13,
            14: 14,
            15: 13,
            16: 24,
            17: 13,
            18: 13,
            19: 12,
            20: 12,
            21: 16,
            22: 13,
            23: 14,
            24: 11,
            25: 11,
            26: 12,
            27: 12,
            28: 11,
            29: 10,
            30: 11,
            31: 10,
            32: 10,
            33: 10,
            34: 9,
            35: 12,
          },
        }}
        HighlightedX={{
          apple: 7.8,
          banana: 27,
          carrot: 16.5,
        }}
        //{...props}
      />
    );
    return component;
  },
};

export = story;
