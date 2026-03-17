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

function sampleAt(sorted: [number, number][], x: number) {
  if (x <= sorted[0][0]) return sorted[0][1];
  if (x >= sorted[sorted.size() - 1][0]) return sorted[sorted.size() - 1][1];

  for (let i = 0; i < sorted.size() - 1; i++) {
    const [x0, y0] = sorted[i];
    const [x1, y1] = sorted[i + 1];
    if (x0 === x1) return y1;
    if (x >= x0 && x <= x1) {
      const alpha = (x - x0) / (x1 - x0);
      return y0 + (y1 - y0) * alpha;
    }
  }

  return sorted[sorted.size() - 1][1];
}

function clampDomainEntries(
  entries: [string, number][],
  domainRange: DomainRange,
): [number, number][] {
  if (entries.size() === 0) return [];

  const parsed = entries
    .map(([rawX, rawY]) => [tonumber(rawX) as number, rawY] as [number, number])
    .filter(([x]) => typeIs(x, "number"));

  if (parsed.size() === 0) return [];

  const domainMin = domainRange.DomainMin;
  const domainMax = domainRange.DomainMax;
  const rangeMin = domainRange.RangeMin;

  const sorted = parsed.sort(([a], [b]) => a < b);

  const domainSpan = math.max(domainMax - domainMin, 1e-6);

  const leftSample = sampleAt(sorted, domainMin);
  const rightSample = sampleAt(sorted, domainMax);

  const clamped: [number, number][] = [];

  clamped.push([domainMin, rangeMin]);
  clamped.push([domainMin, leftSample]);

  for (const [x, y] of sorted) {
    if (x > domainMin && x < domainMax) {
      clamped.push([x, y]);
    }
  }

  clamped.push([domainMax, rightSample]);
  clamped.push([domainMax, rangeMin]);
  clamped.push([domainMax, 0]);

  if (domainSpan <= 1e-6) {
    return [
      [domainMin, rangeMin],
      [domainMin, leftSample],
      [domainMin, rangeMin],
      [domainMin, 0],
    ];
  }

  return clamped;
}

// Control point loaders
function LoadLines(
  path2d: Path2D,
  line: GraphData[number],
  domainRange: DomainRange,
) {
  const entries = clampDomainEntries(Object.entries(line.data), domainRange);
  path2d.SetControlPoints(
    entries.map(([x, y]) => makePoint(...normalizePoint(domainRange, x, y))),
  );
}
function LoadSpline(
  path2d: Path2D,
  line: GraphData[number],
  domainRange: DomainRange,
) {
  const entries = clampDomainEntries(Object.entries(line.data), domainRange);
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
  const entries = clampDomainEntries(Object.entries(line.data), domainRange);
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
  if (path2d.GetControlPoints().size() === 0) return [];

  const SAMPLES = GRADIENT_RES * 2;
  const xToY = new Map<number, number>();

  for (let s of $range(0, SAMPLES)) {
    const pos = path2d.GetPositionOnCurve(s / SAMPLES);
    let px = math.clamp(
      math.round(pos.X.Scale * (GRADIENT_RES - 1)),
      0,
      GRADIENT_RES - 1,
    );
    if (
      (math as unknown as { isfinite: (x: number) => boolean }).isfinite(px) &&
      !xToY.has(px)
    )
      xToY.set(px, pos.Y.Scale);
  }

  const lut: number[] = table.create(GRADIENT_RES, 0);
  let lastX = 0;
  let lastY = xToY.get(0) ?? 0;

  for (let px of $range(0, GRADIENT_RES)) {
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
    startClockRef.current = os.clock();

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
  }, [Data, domainRange, Mode]);

  return (
    <frame
      Size={new UDim2(1, 0, 1, 0)}
      ref={containerRef}
      BackgroundTransparency={1}
    >
      {interpolateFuncs.map(
        (func, index) =>
          func(0) !== undefined && (
            <EditableImageGradient
              key={index}
              ZIndex={index * 2}
              Color={GetKeyColor(index + 1)}
              Function={func}
              StartClock={startClockRef.current}
              Label={`line ${index + 1} of ${interpolateFuncs.size()} (${Mode})`}
            />
          ),
      )}
    </frame>
  );
}
