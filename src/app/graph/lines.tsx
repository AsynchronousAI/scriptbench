import { InstanceEvent, RefObject, useState } from "@rbxts/react";
import { usePx } from "hooks/usePx";
import React from "@rbxts/react";
import { Object } from "@rbxts/luau-polyfill";
import { AsPosition, forEachLine } from "./computation";
import { LINE_WIDTH } from "configurations";
import { GraphAtoms } from "app/graph/atoms";
import { GetKeyColor } from "colors";
import { DomainRange, GraphData } from "./types";

const MIN_TRANSPARENCY = 0.9;

function Line(props: {
  Container?: RefObject<Frame>;

  /* line attr */
  StartX: number;
  StartY: number;
  EndX: number;
  EndY: number;
  Color: Color3;
  Name: string;

  /* graph attr */
  domainRange: DomainRange;
}) {
  const px = usePx();

  const { DomainMin, DomainMax, RangeMin, RangeMax } = props.domainRange;

  const Events = {
    MouseEnter: () => {
      GraphAtoms.hoveringLine((current) => ({
        text: props.Name,
        color: props.Color,
        position: current ? current.position : new Vector2(0, 0),
      }));
    },
    MouseLeave: () => {
      GraphAtoms.hoveringLine((current) => ({
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
                MIN_TRANSPARENCY -
                  AsPosition(RangeMin, RangeMax, props.StartY) / 1.75,
              ),
              new NumberSequenceKeypoint(1, MIN_TRANSPARENCY),
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
  let lines: defined[] = [];
  forEachLine(props.Data, (x, y, nextX, nextY, data, color, index) => {
    lines.push(
      <Line
        Name={data.name}
        StartX={x}
        Container={props.Container}
        StartY={y}
        EndX={nextX}
        EndY={nextY}
        Color={color}
        domainRange={props.domainRange}
      />,
    );
  });
  return lines;
}
