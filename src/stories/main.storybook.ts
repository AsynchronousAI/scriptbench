import { Storybook } from "@rbxts/ui-labs";

const storybook: Storybook = {
  name: "Benchmarker UI",
  storyRoots: [script.Parent as Instance],
  groupRoots: false,
};

export = storybook;
