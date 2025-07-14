import { Object } from "@rbxts/luau-polyfill";
import React from "@rbxts/react";
import { ScrollFrame } from "@rbxts/studiocomponents-react2";
import { COLORS, ShouldUseBlackText } from "colors";
import { FormatNumber, GetKeyColor } from "graph";
import { usePx } from "hooks/usePx";

export type MicroProfilerData = { [key: string]: number };
export interface MicroProfilerProps {
  Results: MicroProfilerData;
}
const HEIGHT = 45;
const PADDING = 0.25; /* in scale */
export default function MicroProfiler(props: MicroProfilerProps) {
  const px = usePx();
  const maxTime =
    math.max(...Object.values(props.Results)) *
    1.01; /* multiply for a bit of padding */

  return (
    <ScrollFrame ScrollingDirection={Enum.ScrollingDirection.XY}>
      {Object.entries(props.Results).map(([name, time]) => {
        const color = GetKeyColor(name as string)[0];

        return (
          <frame /* No idea on how to add padding for ScrollBar, so just stack frames :> */
            BackgroundTransparency={1}
            Size={new UDim2(time / maxTime, 0, 0, px(HEIGHT))}
            LayoutOrder={time}
          >
            <frame
              BorderColor3={COLORS.Border}
              BackgroundColor3={color}
              Size={new UDim2(time / maxTime, 0, 1 - PADDING, 0)}
            >
              <textlabel
                Text={`<b>${name as string}</b> ${FormatNumber(time)}µs`}
                RichText
                TextColor3={COLORS.DarkText}
                TextTransparency={0.2}
                Font={"Code"}
                TextScaled
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Center}
                BackgroundTransparency={1}
                Size={new UDim2(1, -px(20), 0.65, 0)}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
              />
              <uigradient
                Color={
                  new ColorSequence([
                    new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
                    new ColorSequenceKeypoint(1, new Color3(0.85, 0.85, 0.85)),
                  ])
                }
              />
            </frame>
          </frame>
        );
      })}
    </ScrollFrame>
  );
}
