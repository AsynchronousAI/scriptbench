import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import App from "app";

const controls = {};

const story = {
  react: React,
  reactRoblox: ReactRoblox,
  controls: controls,
  story: (input: { controls: {} }) => {
    const component = <App />;
    return component;
  },
};

export = story;
