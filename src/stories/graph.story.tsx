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
          a: [0, 1, 2, 3, 5, 4, 5],
          b: [0, 5, 4, 3, 4, 2, 1],
        }}
        BaselineZero={true}
        //{...props}
      />
    );
    return component;
  },
};

export = story;
