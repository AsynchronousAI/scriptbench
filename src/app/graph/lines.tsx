import React, { InstanceEvent, RefObject, useMemo } from "@rbxts/react";

import { useEffect, useState } from "@rbxts/react";
import { DomainRange, GraphData } from "./types";
import { AsPosition, forEachLine } from "./computation";
import { usePx } from "hooks/usePx";
import { GraphAtoms } from "./atoms";
import { LINE_WIDTH } from "configurations";
import { GetKeyColor } from "colors";
import { Object } from "@rbxts/luau-polyfill";
import { EditableImageGradient } from "./editableImage";

/* Gradient */
function interpolateY(points: { [x: number]: number }, x: number): number {
  const xs = Object.keys(points).sort((a, b) => a < b);

  const size = xs.size() - 1;
  if (x <= xs[0]) {
    return points[xs[0]];
  }
  if (x >= xs[size]) {
    return points[xs[size]];
  }

  for (let i = 0; i < size; i++) {
    const x1 = xs[i];
    const x2 = xs[i + 1];

    if (x >= x1 && x <= x2) {
      const y1 = points[x1];
      const y2 = points[x2];
      const t = (x - x1) / (x2 - x1);
      return y1 + (y2 - y1) * t;
    }
  }

  return 0; // fallback (shouldn't be reached)
}

export function EditableImageLineGradients(props: {
  Data: GraphData;
  domainRange: DomainRange;
}) {
  const { Data, domainRange } = props;

  const interpolateFuncs = useMemo(() => {
    return Data.map((line) => (x: number) => {
      const newX = math.map(
        x,
        0,
        1,
        domainRange.DomainMin,
        domainRange.DomainMax,
      );
      const y = interpolateY(line.data, newX);
      return AsPosition(domainRange.RangeMin, domainRange.RangeMax, y, true);
    });
  }, [Data, domainRange]);

  return (
    <>
      {Data.map((line, index) => (
        <EditableImageGradient
          key={index}
          Color={GetKeyColor(index + 1)}
          Function={interpolateFuncs[index]}
        />
      ))}
    </>
  );
}

/* Lines */
function Line(props: {
  Container?: RefObject<Frame | CanvasGroup>;

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
  const [absoluteSize, setAbsoluteSize] = useState(new Vector2(0, 0));
  useEffect(() => {
    const container = props.Container?.current;
    if (container) {
      setAbsoluteSize(container.AbsoluteSize);
      container.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
        setAbsoluteSize(container.AbsoluteSize);
      });
    }
  }, [props.Container]);

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

  const startX =
    AsPosition(DomainMin, DomainMax, props.StartX) * absoluteSize.X;
  const startY =
    AsPosition(RangeMin, RangeMax, props.StartY, true) * absoluteSize.Y;

  const endX = AsPosition(DomainMin, DomainMax, props.EndX) * absoluteSize.X;
  const endY =
    AsPosition(RangeMin, RangeMax, props.EndY, true) * absoluteSize.Y;

  const dx = endX - startX;
  const dy = endY - startY;
  const distance = math.sqrt(dx * dx + dy * dy);
  return (
    <>
      {/* Travel across X */}
      <frame
        BorderSizePixel={0}
        BackgroundColor3={props.Color}
        Event={Events}
        AnchorPoint={new Vector2(0.5, 0.5)}
        Rotation={math.deg(math.atan2(endY - startY, endX - startX))}
        Size={new UDim2(0, distance + px(LINE_WIDTH) / 2, 0, px(LINE_WIDTH))}
        Position={new UDim2(0, (startX + endX) / 2, 0, (startY + endY) / 2)}
      />
    </>
  );
}
export function EditableImageLines(props: {
  Data: GraphData;
  domainRange: DomainRange;
  Container?: RefObject<Frame | CanvasGroup>;
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
  return (
    <>
      <EditableImageLineGradients
        Data={props.Data}
        domainRange={props.domainRange}
      />
      {lines}
    </>
  );
}
