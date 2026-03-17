import { Object } from "@rbxts/luau-polyfill";
import React, { useState } from "@rbxts/react";
import { Button, ScrollFrame } from "@rbxts/studiocomponents-react2";
import { COLORS, GetKeyColor, LightenColor } from "colors";
import { FormatNumber } from "./graph/computation";
import { Settings } from "settings";
import { ProfileLog, Stats } from "benchmark/types";

export type MicroProfilerData = { [key: string]: number };
export interface MicroProfilerProps {
  Results: MicroProfilerData;
  MicroProfiler?: Map<string, Stats<ProfileLog>>;
  OnClick?: (parentName: string, name: string) => void;
  SeriesOrder?: string[];
}

const makeGradient = (color: Color3) =>
  new ColorSequence([
    new ColorSequenceKeypoint(0, LightenColor(color, 0.025)),
    new ColorSequenceKeypoint(1, color),
  ]);

const getSeriesColor = (
  name: string,
  fallbackIndex: number,
  seriesOrder?: string[],
) => {
  const matchedIndex = seriesOrder?.findIndex((series) => series === name);
  if (matchedIndex !== undefined && matchedIndex >= 0) {
    return GetKeyColor(matchedIndex + 1);
  }
  return GetKeyColor(fallbackIndex + 1);
};

function MicroProfilerProcesses(props: {
  processes: Stats<ProfileLog>;
  maxTime: number;
  color: Color3;
  onClick?: (name: string) => void;
}) {
  const prioritized = Settings.GetSetting("PrioritizedStat");
  const entries = props.processes[
    prioritized as keyof Stats<ProfileLog>
  ] as ProfileLog;

  let offset = 0;
  const positioned = entries.map((entry) => {
    const pos = offset;
    offset += entry.time / props.maxTime;
    return { entry, pos };
  });

  return positioned.map(({ entry, pos }, index) => {
    const label = entry.name === false ? "Untracked" : (entry.name as string);
    const width = entry.time / props.maxTime;
    const color = LightenColor(props.color, index * 0.025);
    const zindex = index + 2;

    return (
      <textbutton
        key={label}
        ZIndex={zindex}
        BorderColor3={COLORS.Border}
        BackgroundColor3={new Color3(1, 1, 1)}
        Size={new UDim2(width, 0, 1, 0)}
        Position={new UDim2(pos, 0, 0, 0)}
        Text=""
        AutoButtonColor={false}
        Event={{ MouseButton1Click: () => props.onClick?.(label) }}
      >
        {width > 0 && (
          <textlabel
            Text={`<b>${label}</b> ${FormatNumber(entry.time)}µs`}
            RichText
            TextColor3={COLORS.DarkText}
            TextTransparency={0.2}
            Font={"Code"}
            TextScaled
            TextXAlignment={Enum.TextXAlignment.Left}
            TextYAlignment={Enum.TextYAlignment.Center}
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 0.75, 0)}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            ZIndex={zindex + 1}
          >
            <uipadding
              PaddingLeft={new UDim(0.02, 0)}
              PaddingRight={new UDim(0.02, 0)}
            />
          </textlabel>
        )}
        <uigradient Color={makeGradient(color)} />
      </textbutton>
    );
  });
}

const ZOOM_ICON = "rbxassetid://12072054746";
const SHRINK_ICON = "rbxassetid://15396333997";

export default function MicroProfiler(props: MicroProfilerProps) {
  const [spacing, setSpacing] = useState(0);

  const maxTime = math.max(...Object.values(props.Results)) * 1.01;
  const displaySize = maxTime + spacing;

  return (
    <>
      <Button
        ZIndex={2}
        Icon={{
          Image: ZOOM_ICON,
          Size: Vector2.one.mul(24),
          UseThemeColor: true,
          Alignment: Enum.HorizontalAlignment.Left,
        }}
        Size={new UDim2(0, 25, 0, 25)}
        Position={new UDim2(0.95, 0, 0.5, -15)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        OnActivated={() => setSpacing((s) => s - 5)}
      />
      <Button
        ZIndex={2}
        Icon={{
          Image: SHRINK_ICON,
          Size: Vector2.one.mul(24),
          UseThemeColor: true,
          Alignment: Enum.HorizontalAlignment.Left,
        }}
        Size={new UDim2(0, 25, 0, 25)}
        Position={new UDim2(0.95, 0, 0.5, 15)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        OnActivated={() => setSpacing((s) => s + 5)}
      />
      <ScrollFrame ScrollingDirection={Enum.ScrollingDirection.XY}>
        {Object.entries(props.Results).map(([name, time], index) => {
          const color = getSeriesColor(
            name as string,
            index,
            props.SeriesOrder,
          );
          const microprofiler = props.MicroProfiler?.get(name as string);
          const hasProcesses = (microprofiler?.Avg?.size() ?? 0) > 0;
          const barWidth = new UDim2(time / displaySize, 0, 0.25, 0);

          return (
            <>
              <frame
                key={`bar-${name}`}
                BorderColor3={COLORS.Border}
                BackgroundColor3={new Color3(1, 1, 1)}
                Size={barWidth}
                LayoutOrder={maxTime - time}
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
                  Size={new UDim2(1, 0, 0.65, 0)}
                  Position={new UDim2(0.5, 0, 0.5, 0)}
                  AnchorPoint={new Vector2(0.5, 0.5)}
                >
                  <uipadding
                    PaddingLeft={new UDim(0.02, 0)}
                    PaddingRight={new UDim(0.02, 0)}
                  />
                </textlabel>
                <uigradient Color={makeGradient(color)} />
              </frame>

              {hasProcesses && (
                <frame
                  key={`processes-${name}`}
                  BackgroundTransparency={1}
                  Size={barWidth}
                  LayoutOrder={maxTime - time}
                >
                  <MicroProfilerProcesses
                    processes={microprofiler!}
                    maxTime={displaySize}
                    color={color}
                    onClick={(blockName) =>
                      props.OnClick?.(name as string, blockName)
                    }
                  />
                </frame>
              )}
            </>
          );
        })}
      </ScrollFrame>
    </>
  );
}
