import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import Graph, { GraphProps } from "graph";

const controls = {};

const story = {
  react: React,
  reactRoblox: ReactRoblox,
  controls: controls,
  story: (input: { controls: GraphProps }) => {
    const props: GraphProps = input.controls;
    const component = (
      <Graph
        Resolution={15}
        Data={{
          a: {
            1: 1,
            2: 2,
            3: 5,
            4: 7,
            5: 8,
            6: 6,
            7: 4,
            8: 3,
            9: 2,
            10: 1,
          },
          b: {
            1: 0,
            2: 0,
            3: 1,
            4: 2,
            5: 4,
            6: 5,
            7: 6,
            8: 6,
            9: 5,
            10: 2,
          },
        }}
        BaselineZero={false}
        HighlightedX={{
          a: 6,
          b: 9,
        }}
        //{...props}
      />
    );
    return component;
  },
};

export = story;
