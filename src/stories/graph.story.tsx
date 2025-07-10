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
        Resolution={10}
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
        }}
        BaselineZero={false}
        //{...props}
      />
    );
    return component;
  },
};

export = story;
