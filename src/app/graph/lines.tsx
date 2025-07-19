import { InstanceEvent, RefObject, useState } from "@rbxts/react";
import { DomainRange, GraphData } from ".";
import { usePx } from "hooks/usePx";
import { COLORS } from "colors";
import React from "@rbxts/react";
import { Object } from "@rbxts/luau-polyfill";
import {
  AsPosition,
  FormatNumber,
  FromPosition,
  GetKeyColor,
} from "./computation";
import { LINE_WIDTH } from "configurations";

function Line(props: {
  Container?: RefObject<Frame>;

  /* line attr */
  StartX: number;
  StartY: number;
  EndX: number;
  EndY: number;
  Color: Color3;
  Name: string;
  ZIndex: number;

  /* graph attr */
  domainRange: DomainRange;
}) {
  const px = usePx();
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  const { DomainMin, DomainMax, RangeMin, RangeMax } = props.domainRange;

  const Events = {
    MouseEnter: () => {
      setShowLabel(true);
    },
    MouseLeave: () => {
      setShowLabel(false);
    },
    MouseMoved: (_: Instance, mouseX: number, mouseY: number) => {
      const container = props.Container?.current;
      if (!container) return;

      const guiX = container.AbsolutePosition.X;
      const guiY = container.AbsolutePosition.Y;
      const guiSizeX = container.AbsoluteSize.X;
      const guiSizeY = container.AbsoluteSize.Y;

      setX((mouseX - guiX) / guiSizeX);
      setY((mouseY - guiY) / guiSizeY);
    },
  } as unknown as InstanceEvent<Frame>;

  return (
    <>
      {/* Label */}
      <frame
        Visible={showLabel}
        Size={new UDim2(0.15, 0, 0.15, 0)}
        BackgroundColor3={COLORS.LightBackground}
        BorderColor3={COLORS.Border}
        Position={new UDim2(x, 0, y, 0)}
        ZIndex={props.ZIndex + 1}
      >
        <uipadding
          PaddingTop={new UDim(0.1, 0)}
          PaddingBottom={new UDim(0.1, 0)}
        />
        <textlabel
          Font={Enum.Font.Code}
          Size={new UDim2(1, 0, 1, 0)}
          BackgroundTransparency={1}
          TextColor3={COLORS.FocusText}
          TextScaled
          ZIndex={props.ZIndex + 2}
          RichText
          Text={`<b><font color="#${props.Color.ToHex()}">${props.Name}</font></b>
${FormatNumber(FromPosition(DomainMin, DomainMax, x))}µs
${math.floor(FromPosition(RangeMin, RangeMax, y, true))} Calls`}
        />
      </frame>

      {/* Travel across X */}
      <frame
        BorderSizePixel={0}
        BackgroundColor3={props.Color}
        ZIndex={props.ZIndex}
        Event={Events}
        Size={
          new UDim2(
            AsPosition(DomainMin, DomainMax, props.EndX) -
              AsPosition(DomainMin, DomainMax, props.StartX),
            px(LINE_WIDTH),
            0,
            px(LINE_WIDTH),
          )
        }
        Position={
          new UDim2(
            AsPosition(DomainMin, DomainMax, props.StartX),
            0,
            AsPosition(RangeMin, RangeMax, props.StartY, true),
            0,
          )
        }
      />

      {/* Travel across Y */}
      <frame
        BorderSizePixel={0}
        BackgroundColor3={props.Color}
        ZIndex={props.ZIndex}
        Event={Events}
        Size={
          new UDim2(
            0,
            px(LINE_WIDTH),
            AsPosition(RangeMin, RangeMax, props.EndY) -
              AsPosition(RangeMin, RangeMax, props.StartY),
            0,
          )
        }
        Position={
          new UDim2(
            AsPosition(DomainMin, DomainMax, props.EndX),
            0,
            AsPosition(RangeMin, RangeMax, props.EndY, true),
            0,
          )
        }
      />

      {/* Gradient */}
      <frame
        BorderSizePixel={0}
        BackgroundColor3={props.Color}
        ZIndex={props.ZIndex}
        Size={
          new UDim2(
            AsPosition(DomainMin, DomainMax, props.StartX) -
              AsPosition(DomainMin, DomainMax, props.EndX),
            0,
            AsPosition(RangeMin, RangeMax, props.StartY),
            0,
          )
        }
        Position={
          new UDim2(
            AsPosition(DomainMin, DomainMax, props.EndX),
            0,
            AsPosition(RangeMin, RangeMax, props.StartY, true),
            0,
          )
        }
      >
        <uigradient
          Rotation={90}
          Transparency={
            new NumberSequence([
              new NumberSequenceKeypoint(
                0,
                1 - AsPosition(RangeMin, RangeMax, props.StartY) / 1.75,
              ),
              new NumberSequenceKeypoint(1, 1),
            ])
          }
        />
      </frame>
    </>
  );
}
export function Lines(props: {
  Data: GraphData;
  domainRange: DomainRange;
  Container?: RefObject<Frame>;
}) {
  const allXSet = new Set<number>();
  for (const series of Object.values(props.Data)) {
    for (const x of Object.keys(series)) {
      allXSet.add(tonumber(x) as number);
    }
  }
  const allX = [...allXSet];
  allX.sort((a, b) => a < b);

  let lines = [];
  for (const [key, points] of pairs(props.Data)) {
    const [color, seed] = GetKeyColor(key as string);

    let prevY: number | undefined = undefined;
    for (let i = 0; i < allX.size(); i++) {
      const x = allX[i];
      const nextX = allX[i + 1];
      if (nextX === undefined) continue;

      const y = (points[x] ? points[x] : prevY ? prevY : 0) as number;
      const nextY = points[nextX] !== undefined ? points[nextX] : y;

      prevY = y;

      lines.push(
        <Line
          Name={key as string}
          StartX={x}
          Container={props.Container}
          StartY={y}
          EndX={nextX}
          EndY={nextY}
          Color={color}
          domainRange={props.domainRange}
          ZIndex={seed}
        />,
      );
    }
  }
  return lines;
}
