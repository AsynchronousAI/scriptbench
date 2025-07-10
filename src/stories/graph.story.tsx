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
            3: 3,
            4: 4,
          },
          b: {
            1: 2,
            2: 3,
            3: 4,
            4: 5,
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
