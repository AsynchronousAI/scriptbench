import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import Results, { ResultsProps } from "app/results";

const controls = {};

const story = {
  react: React,
  reactRoblox: ReactRoblox,
  controls: controls,
  story: (input: { controls: ResultsProps }) => {
    const props: ResultsProps = input.controls;
    const component = (
      <Results
        Results={[
          {
            Index: 2,
            Order: 1,
            Name: "t[i]",
            NumberData: [
              ["Key1", 1],
              ["Key2", 2],
              ["Key3", 3],
            ],
          },
          {
            Index: 3,
            Order: 2,
            Name: "t[#i+1]",
            NumberData: [
              ["Key1", 1],
              ["Key2", 2],
              ["Key3", 3],
            ],
          },

          {
            Index: 1,
            Order: 3,
            Name: "table.insert",
            NumberData: [
              ["Key1", 1],
              ["Key2", 2],
              ["Key3", 3],
            ],
          },
        ]}
      />
    );
    return component;
  },
};

export = story;
