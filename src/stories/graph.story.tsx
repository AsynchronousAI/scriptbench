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
        Resolution={100}
        Data={{
          a: {
            0.1: 1,
            0.2: 2,
            0.3: 3,
            0.4: 2,
          },
          b: {
            0.1: 2,
            0.2: 3,
            0.3: 2,
            0.4: 1,
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
