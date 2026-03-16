import React, { useEffect, useRef, useState } from "@rbxts/react";
import { DomainRange, GraphData, GraphingMode } from "./types";
import { AsPosition } from "./computation";
import { GetKeyColor } from "colors";
import { EditableImageGradient } from "./imageGradient";
import { Object } from "@rbxts/luau-polyfill";
import { GRADIENT_RES, LINE_WIDTH } from "configurations";
import { RunService } from "@rbxts/services";

function normalizePoint(
  domainRange: DomainRange,
  x: number,
  y: number,
): [nx: number, ny: number] {
  return [
    AsPosition(domainRange.DomainMin, domainRange.DomainMax, x),
    AsPosition(domainRange.RangeMin, domainRange.RangeMax, y, true),
  ];
}
function makePoint(nx: number, ny: number): Path2DControlPoint {
  return new Path2DControlPoint(new UDim2(nx, 0, ny, 0));
}
function makePointWithTangents(
  nx: number,
  ny: number,
  tx: number,
  ty: number,
): Path2DControlPoint {
  return new Path2DControlPoint(
    new UDim2(nx, 0, ny, 0),
    new UDim2(-tx, 0, -ty, 0),
    new UDim2(tx, 0, ty, 0),
  );
}

// Control point loaders
function padDomainEdges(
  entries: [number, number][],
  domainRange: DomainRange,
): [number, number][] {
  // Sort by X first — Object.entries returns Luau table keys in arbitrary order,
  // which caused the path to zigzag wildly between out-of-order points.
  const sorted = [...entries].sort(([a], [b]) => a < b);

  const domainMin = domainRange.DomainMin;
  const domainMax = domainRange.DomainMax;
  const rangeMin = domainRange.RangeMin;

  if (sorted[0][0] > domainMin) {
    sorted.unshift([domainMin, rangeMin]);
  }
  if (sorted[sorted.size() - 1][0] < domainMax) {
    sorted.push([domainMax, rangeMin]);
  }

  return sorted;
}
function LoadLines(
  path2d: Path2D,
  line: GraphData[number],
  domainRange: DomainRange,
) {
  const entries = padDomainEdges(Object.entries(line.data), domainRange);
  path2d.SetControlPoints(
    entries.map(([x, y]) => makePoint(...normalizePoint(domainRange, x, y))),
  );
}
function LoadSpline(
  path2d: Path2D,
  line: GraphData[number],
  domainRange: DomainRange,
) {
  const entries = padDomainEdges(Object.entries(line.data), domainRange);
  const points = entries.map(([x, y]) => normalizePoint(domainRange, x, y));

  path2d.SetControlPoints(
    points.map(([nx, ny], i) => {
      const prev = points[i - 1];
      const next_ = points[i + 1];

      if (!prev || !next_) {
        return makePoint(nx, ny);
      }

      const [prevNx, prevNy] = prev;
      const [nextNx, nextNy] = next_;

      const tx = (nextNx - prevNx) / 4;
      const ty = (nextNy - prevNy) / 4;

      return makePointWithTangents(nx, ny, tx, ty);
    }),
  );
}
function LoadSteps(
  path2d: Path2D,
  line: GraphData[number],
  domainRange: DomainRange,
) {
  const entries = padDomainEdges(Object.entries(line.data), domainRange);
  const controlPoints: Path2DControlPoint[] = [];

  for (let i = 0; i < entries.size(); i++) {
    const [x, y] = entries[i];
    const [nx, ny] = normalizePoint(domainRange, x, y);

    if (i > 0) {
      const [, prevY] = entries[i - 1];
      const [, prevNy] = normalizePoint(domainRange, x, prevY);
      controlPoints.push(makePoint(nx, prevNy));
    }

    controlPoints.push(makePoint(nx, ny));
  }

  path2d.SetControlPoints(controlPoints);
}

// Curve sampling → X→Y LUT
function buildLUT(path2d: Path2D): number[] {
  const SAMPLES = GRADIENT_RES * 2;
  const xToY = new Map<number, number>();

  for (let s = 0; s <= SAMPLES; s++) {
    const pos = path2d.GetPositionOnCurve(s / SAMPLES);
    const px = math.clamp(
      math.round(pos.X.Scale * (GRADIENT_RES - 1)),
      0,
      GRADIENT_RES - 1,
    );
    if (!xToY.has(px)) xToY.set(px, pos.Y.Scale);
  }

  // Fill gaps by interpolating between known neighbours
  const lut: number[] = table.create(GRADIENT_RES, 0);
  let lastX = 0;
  let lastY = xToY.get(0) ?? 0;

  for (let px = 0; px < GRADIENT_RES; px++) {
    if (xToY.has(px)) {
      lastX = px;
      lastY = xToY.get(px)!;
      lut[px] = lastY;
    } else {
      let nextX = px + 1;
      while (nextX < GRADIENT_RES && !xToY.has(nextX)) nextX++;
      const nextY = xToY.get(nextX) ?? lastY;
      const alpha = nextX === lastX ? 1 : (px - lastX) / (nextX - lastX);
      lut[px] = lastY + (nextY - lastY) * alpha;
    }
  }

  return lut;
}

function lutToFunc(lut: number[]): (x: number) => number {
  return (x) =>
    lut[math.clamp(math.round(x * (GRADIENT_RES - 1)), 0, GRADIENT_RES - 1)];
}

// Component
const LOADERS: Record<
  GraphingMode,
  (p: Path2D, l: GraphData[number], d: DomainRange) => void
> = {
  [GraphingMode.Lines]: LoadLines,
  [GraphingMode.Spline]: LoadSpline,
  [GraphingMode.Steps]: LoadSteps,
};
export function Path2D(props: {
  Data: GraphData;
  domainRange: DomainRange;
  Mode: GraphingMode;
}) {
  const { Data, domainRange, Mode } = props;

  const containerRef = useRef<Frame>();
  const startClockRef = useRef<number>(0);

  const [interpolateFuncs, setInterpolateFuncs] = useState<
    ((x: number) => number)[]
  >([]);

  useEffect(() => {
    const current = containerRef.current;
    if (!current) return;

    const paths: Path2D[] = [];
    const events: RBXScriptConnection[] = [];
    startClockRef.current = os.clock(); // set before work begins

    setInterpolateFuncs(
      Data.map((line, index) => {
        const path2d = new Instance("Path2D");
        path2d.Thickness = LINE_WIDTH * 1.5;
        path2d.ZIndex = index + 1;
        path2d.Parent = current;
        paths.push(path2d);

        events.push(
          RunService.Heartbeat.Connect(() => {
            path2d.Color3 = GetKeyColor(index + 1);
          }),
        );

        LOADERS[Mode](path2d, line, domainRange);

        return lutToFunc(buildLUT(path2d));
      }),
    );

    return () => {
      paths.forEach((p) => p.Destroy());
      events.forEach((e) => e.Disconnect());
    };
  }, [Data, domainRange, containerRef, Mode]);

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
          StartClock={startClockRef.current}
          Label={`line ${index + 1} of ${interpolateFuncs.size()} (${Mode})`}
        />
      ))}
    </frame>
  );
}
