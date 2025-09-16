import React, { RefObject, useEffect, useState } from "@rbxts/react";

import { DomainRange, GraphData } from "./types";
import { AsPosition } from "./computation";
import { GetKeyColor } from "colors";
import { EditableImageGradient } from "./imageGradient";
import { Object } from "@rbxts/luau-polyfill";
import { LINE_WIDTH } from "configurations";

/* Gradient */
const tangent = 0;

const leftTan = new UDim2(-tangent, 0, 0, 0);
const rightTan = new UDim2(tangent, 0, 0, 0);

/* Lines */
export function EditableImageSpline(props: {
  Data: GraphData;
  domainRange: DomainRange;
  Container?: RefObject<Frame | CanvasGroup>;
}) {
  const { Data, domainRange } = props;

  const [interpolateFuncs, setInterpolateFuncs] = useState<
    ((x: number) => number)[]
  >([]);

  useEffect(() => {
    const current = props.Container?.current!;
    if (!current) return;

    const paths: Path2D[] = [];

    setInterpolateFuncs(
      Data.map((line, index) => {
        const newPath2d = new Instance("Path2D");
        newPath2d.Thickness = LINE_WIDTH * 1.5;
        newPath2d.ZIndex = math.huge;
        newPath2d.Color3 = GetKeyColor(index + 1);
        newPath2d.Parent = current;
        paths.push(newPath2d);

        const controlPoints = Object.entries(line.data).map(([x, y]) => {
          const newX = AsPosition(
            domainRange.DomainMin,
            domainRange.DomainMax,
            x,
          );
          const newY = AsPosition(
            domainRange.RangeMin,
            domainRange.RangeMax,
            y,
            true,
          );
          return new Path2DControlPoint(
            new UDim2(newX, 0, newY, 0),
            leftTan,
            rightTan,
          );
        });
        newPath2d.SetControlPoints(controlPoints);

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
  }, [Data, domainRange, props.Container]);

  return (
    <>
      {props.Container?.current &&
        interpolateFuncs.map((func, index) => (
          <EditableImageGradient
            key={index}
            Color={GetKeyColor(index + 1)}
            Function={func}
          />
        ))}
    </>
  );
}
