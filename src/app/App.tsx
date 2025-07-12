import React from "@rbxts/react";
import Graph from "graph";

export function App() {
  return (
    <>
      <Graph
        Resolution={100}
        Data={{
          a: [1, 2, 3, 4, 5],
          b: [5, 4, 3, 2, 1],
        }}
      />
      <textlabel
        AnchorPoint={new Vector2(0.5, 0.5)}
        BackgroundTransparency={1}
        Text="Hello!"
        TextScaled={true}
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextStrokeTransparency={0.7}
        Size={new UDim2(1, 0, 1, 0)}
        Position={new UDim2(0.5, 0, 0.5, 0)}
      />
    </>
  );
}

export default App;
