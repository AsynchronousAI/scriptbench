import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import MicroProfiler, { MicroProfilerProps } from "app/microprofiler";

const controls = {};

const story = {
  react: React,
  reactRoblox: ReactRoblox,
  controls: controls,
  story: (input: { controls: MicroProfilerProps }) => {
    const props: MicroProfilerProps = input.controls;
    const component = (
      <MicroProfiler
        Results={{
          "Sample A": 32,
          "Sample B": 42,
          "Sample C": 69,
          "Sample D": 74,
          "Sample E": 52,
          "Sample F": 41,
          "Sample G": 23,
          "Sample H": 34,
        }}
        MicroProfiler={
          new Map([
            /* hand writing this is pain :( */
            [
              "Sample E",
              {
                Avg: [
                  { time: 16, name: "Main" },
                  { time: 16, name: "SecondMain" },
                ],
                "50%": [],
                "90%": [],
                "10%": [],
                Min: [],
                Max: [],
                MAD: [],
                StdDev: [],
                Mode: [],
              },
            ],
          ])
        }
      />
    );
    return component;
  },
};

export = story;
