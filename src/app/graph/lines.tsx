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
import { Atoms } from "app/atoms";

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

  const { DomainMin, DomainMax, RangeMin, RangeMax } = props.domainRange;

  const Events = {
    MouseEnter: () => {
      Atoms.hoveringLine((current) => ({
        text: props.Name,
        color: props.Color,
        position: current ? current.position : new Vector2(0, 0),
      }));
    },
    MouseLeave: () => {
      Atoms.hoveringLine((current) => ({
        text: undefined,
        color: props.Color,
        position: current ? current.position : new Vector2(0, 0),
      }));
    },
  } as unknown as InstanceEvent<Frame>;

  return (
    <>
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
