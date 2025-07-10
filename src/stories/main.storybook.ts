import { Storybook } from "@rbxts/ui-labs";

const storybook: Storybook = {
  name: "Plugin",
  storyRoots: [script.Parent as Instance],
  groupRoots: false,
};

export = storybook;
