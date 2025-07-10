import { COLORS } from "colors";
import React from "react";

export interface ProgressProps {
  value: number;
}

export default function Progress(props: ProgressProps) {
  return (
    <canvasgroup
      AnchorPoint={new Vector2(0.5, 0.5)}
      Position={new UDim2(0.5, 0, 0.5, 0)}
      Size={new UDim2(1, 0, 0.1, 0)}
      BackgroundColor3={COLORS.Background}
    >
      <uicorner CornerRadius={new UDim(0.25, 0)} />

      <frame
        Size={new UDim2(props.value, 0, 1, 0)}
        BackgroundColor3={COLORS.Selected}
      />

      <textlabel
        Size={new UDim2(1, 0, 1, 0)}
        Font="BuilderSansBold"
        TextColor3={COLORS.Text}
        TextScaled
        BackgroundTransparency={1}
        Text={string.format("%d%%", props.value * 100)}
      >
        <uipadding
          PaddingTop={new UDim(0.1, 0)}
          PaddingBottom={new UDim(0.1, 0)}
        />
      </textlabel>
    </canvasgroup>
  );
}
