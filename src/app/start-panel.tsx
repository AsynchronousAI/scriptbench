import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { MainButton, NumericInput } from "@rbxts/studiocomponents-react2";
import { startBenchmark } from "./actions";
import { Atoms } from "./atoms";

export function StartPanel() {
  const calls = useAtom(Atoms.calls);

  return (
    <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
      <uipadding
        PaddingTop={new UDim(0, 12)}
        PaddingBottom={new UDim(0, 12)}
        PaddingLeft={new UDim(0, 12)}
        PaddingRight={new UDim(0, 12)}
      />
      <uilistlayout
        FillDirection={Enum.FillDirection.Vertical}
        Padding={new UDim(0, 12)}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        VerticalAlignment={Enum.VerticalAlignment.Center}
      />
      <MainButton
        Text="Start Benchmark"
        Size={new UDim2(1, 0, 0, 32)}
        OnActivated={startBenchmark}
      />
      <NumericInput
        Value={calls}
        OnValidChanged={(value) => Atoms.calls(value)}
        Size={new UDim2(1, 0, 0, 32)}
        Arrows
        Slider={false}
      />
    </frame>
  );
}

export default StartPanel;
