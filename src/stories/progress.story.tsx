import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import Progress, { ProgressProps } from "app/proress";

const controls = {
  value: 0.5,
};

const story = {
  react: React,
  reactRoblox: ReactRoblox,
  controls: controls,
  story: (input: { controls: ProgressProps }) => {
    const props: ProgressProps = input.controls;
    const component = <Progress {...props} />;
    return component;
  },
};

export = story;
