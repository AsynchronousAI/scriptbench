import { Object } from "@rbxts/luau-polyfill";
import React from "@rbxts/react";
import { ScrollFrame } from "@rbxts/studiocomponents-react2";
import { ProfileLog, Stats } from "benchmark";
import { COLORS, LightenColor } from "colors";
import { usePx } from "hooks/usePx";
import { FormatNumber, GetKeyColor } from "./graph/computation";
import { Settings } from "settings";

/* Constants  */
const gradient = (color: Color3) =>
  new ColorSequence([
    new ColorSequenceKeypoint(0, LightenColor(color, 0.025)),
    new ColorSequenceKeypoint(1, color),
  ]);

/* Types */
export type MicroProfilerData = { [key: string]: number };
export interface MicroProfilerProps {
  Results: MicroProfilerData;
  MicroProfiler?: Map<string, Stats<ProfileLog>>;
  OnClick?: (parentName: string, name: string) => void;
}

/* Export */
function MicroProfilerProcesses(props: {
  processes: Stats<ProfileLog>;
  maxTime: number;
  time: number;
  color: Color3;
  onClick?: (name: string) => void;
}) {
  const usingProcesses =
    props.processes[
      Settings.GetSetting("PrioritizedStat") as keyof Stats<ProfileLog>
    ];
  const px = usePx();

  let position = 0;
  let color = props.color;

  return usingProcesses.map(({ time, name }, index) => {
    const zindex = index + 2;

    const thisPosition = position;
    position += time / props.maxTime;

    color = LightenColor(color);

    if (name === false) name = "Untracked";

    return (
      <textbutton
        ZIndex={zindex}
        BorderColor3={COLORS.Border}
        BackgroundColor3={new Color3(1, 1, 1)}
        Size={new UDim2(time / props.maxTime, 0, 1, 0)}
        Position={new UDim2(thisPosition, 0, 0, 0)}
        Text=""
        AutoButtonColor={false}
        Event={{
          MouseButton1Click: () => {
            props.onClick?.(name);
          },
        }}
      >
        {time / props.maxTime >
          0 /* do not show if the frame is too small */ && (
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
            Size={new UDim2(1, -px(20), 0.75, 0)}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            ZIndex={zindex + 1}
          />
        )}
        <uigradient Color={gradient(color)} />
      </textbutton>
    );
  });
}
export default function MicroProfiler(props: MicroProfilerProps) {
  const px = usePx();
  const maxTime =
    math.max(...Object.values(props.Results)) *
    1.01; /* multiply for a bit of padding */

  return (
    <ScrollFrame ScrollingDirection={Enum.ScrollingDirection.XY}>
      {Object.entries(props.Results).map(([name, time]) => {
        const color = GetKeyColor(name as string)[0];

        const microprofiler = props.MicroProfiler?.get(name as string);
        const microprofilerItems = microprofiler?.Avg?.size();
        const microprofilerExists =
          microprofilerItems && microprofilerItems > 0;

        return (
          <>
            {/* Main frame */}
            <frame
              BorderColor3={COLORS.Border}
              BackgroundColor3={new Color3(1, 1, 1)}
              Size={new UDim2(time / maxTime, 0, 0.25, 0)}
            >
              <textlabel
                Text={`<b>${name as string}</b> ${FormatNumber(time)}µs`}
                RichText
                TextColor3={COLORS.DarkText}
                TextTransparency={0.2}
                ZIndex={3}
                Font={"Code"}
                TextScaled
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Center}
                BackgroundTransparency={1}
                Size={new UDim2(1, -px(20), 0.65, 0)}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
              />
              <uigradient Color={gradient(color)} />
            </frame>

            {/* MicroProfiler frame */}
            {microprofilerExists ? (
              <frame
                BackgroundTransparency={1}
                Size={new UDim2(time / maxTime, 0, 0.25, 0)}
              >
                <MicroProfilerProcesses
                  processes={microprofiler!}
                  maxTime={maxTime}
                  time={time}
                  color={color}
                  onClick={(thisName) =>
                    props.OnClick?.(name as string, thisName)
                  }
                />
              </frame>
            ) : undefined}
          </>
        );
      })}
    </ScrollFrame>
  );
}
