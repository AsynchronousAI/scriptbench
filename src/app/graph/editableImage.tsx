import React, { RefObject, useEffect, useRef, useState } from "@rbxts/react";

import { DomainRange, GraphData, GraphingMode } from "./types";
import { AsPosition } from "./computation";
import { COLORS, GetKeyColor } from "colors";
import { EditableImageGradient } from "./imageGradient";
import { Object } from "@rbxts/luau-polyfill";
import { LINE_WIDTH } from "configurations";

/* Gradient */
const tangent = 0;

const leftTan = new UDim2(-tangent, 0, 0, 0);
const rightTan = new UDim2(tangent, 0, 0, 0);

function LoadLines(
  path2d: Path2D,
  line: GraphData[number],
  domainRange: DomainRange,
) {
  const controlPoints = [];
  const entries = Object.entries(line.data);

  for (let i = 0; i < entries.size(); i++) {
    const [x, y] = entries[i];
    const newX = AsPosition(domainRange.DomainMin, domainRange.DomainMax, x);
    const newY = AsPosition(
      domainRange.RangeMin,
      domainRange.RangeMax,
      y,
      true,
    );
    controlPoints.push(new Path2DControlPoint(new UDim2(newX, 0, newY, 0)));
  }

  path2d.SetControlPoints(controlPoints);
}
function LoadSpline(
  path2d: Path2D,
  line: GraphData[number],
  domainRange: DomainRange,
) {
  const controlPoints = [];
  const entries = Object.entries(line.data);

  for (let i = 0; i < entries.size(); i++) {
    const [x, y] = entries[i];
    const newX = AsPosition(domainRange.DomainMin, domainRange.DomainMax, x);
    const newY = AsPosition(
      domainRange.RangeMin,
      domainRange.RangeMax,
      y,
      true,
    );
    controlPoints.push(
      new Path2DControlPoint(new UDim2(newX, 0, newY, 0), leftTan, rightTan),
    );
  }

  path2d.SetControlPoints(controlPoints);
}

/* Lines */
export function EditableImage(props: {
  Data: GraphData;
  domainRange: DomainRange;
  Mode: GraphingMode;
}) {
  const { Data, domainRange } = props;
  const containerRef = useRef<Frame>();
  const [interpolateFuncs, setInterpolateFuncs] = useState<
    ((x: number) => number)[]
  >([]);

  useEffect(() => {
    const current = containerRef.current!;
    if (!current) return;

    const paths: Path2D[] = [];

    setInterpolateFuncs(
      Data.map((line, index) => {
        const newPath2d = new Instance("Path2D");
        newPath2d.Thickness = LINE_WIDTH * 1.5;
        newPath2d.ZIndex = index + 1;
        newPath2d.Color3 = GetKeyColor(index + 1);
        newPath2d.Parent = current;
        paths.push(newPath2d);

        if (props.Mode === GraphingMode.Spline) {
          LoadSpline(newPath2d, line, domainRange);
        } else if (props.Mode === GraphingMode.Lines) {
          LoadLines(newPath2d, line, domainRange);
        }

        return (x: number) => {
          const relativeX = math.map(
            x,
            0,
            1,
            domainRange.DomainMin,
            domainRange.DomainMax,
          );
          const normalizedX = math.map(
            relativeX,
            domainRange.FullDomainMin,
            domainRange.FullDomainMax,
            0,
            1,
          );
          const pos = newPath2d.GetPositionOnCurve(normalizedX);
          return pos.Y.Scale;
        };
      }),
    );

    return () => {
      for (const path of paths) {
        path.Destroy();
      }
    };
  }, [Data, domainRange, containerRef, props.Mode]);

  return (
    <frame
      Size={new UDim2(1, 0, 1, 0)}
      ref={containerRef}
      BackgroundTransparency={1}
    >
      {interpolateFuncs.map((func, index) => (
        <EditableImageGradient
          key={index}
          ZIndex={index * 2}
          Color={GetKeyColor(index + 1)}
          Function={func}
        />
      ))}
    </frame>
  );
}
