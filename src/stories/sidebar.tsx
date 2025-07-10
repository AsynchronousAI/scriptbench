import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import Sidebar, { SidebarProps } from "app/sidebar";

const controls = {};

const story = {
  react: React,
  reactRoblox: ReactRoblox,
  controls: controls,
  story: (input: { controls: SidebarProps }) => {
    const props: SidebarProps = input.controls;
    const component = (
      <Sidebar Benchmarks={["benchmark1", "benchmark2", "benchmark3"]} />
    );
    return component;
  },
};

export = story;
