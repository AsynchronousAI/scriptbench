import React, { InstanceEvent, ReactNode, RefObject } from "@rbxts/react";

import { useEffect, useState } from "@rbxts/react";
import { DomainRange, GraphData } from "./types";
import { AssetService } from "@rbxts/services";
import { AsPosition, forEachLine } from "./computation";
import { usePx } from "hooks/usePx";
import { GraphAtoms } from "./atoms";
import { LINE_WIDTH } from "configurations";
import CatmullRomSpline from "@rbxts/catmull-rom-spline-fork";
import { Object } from "@rbxts/luau-polyfill";
import { GetKeyColor } from "colors";

/* Main */
const GRADIENT_SIZE = 64;

/* Precompute gradient */
const gradientLUT: number[] = table.create(GRADIENT_SIZE);
for (let i = 0; i < GRADIENT_SIZE; i++) {
  /* linear gradient (0.9 -> 0.1) */
  gradientLUT[i] = math.floor(
    (((GRADIENT_SIZE - i - 1) / (GRADIENT_SIZE - 1)) * 0.8 + 0.1) * 255,
  );
}

/* Gradient */
type SplineData = {
  [key: string]: { index: number; spline: CatmullRomSpline<Vector2> };
};
function DrawSplineGradient(
  image: EditableImage,
  imageBuffer: buffer,
  spline: CatmullRomSpline<Vector2>,
  domainRange: DomainRange,
  color: Color3,
) {
  const width = image.Size.X;
  const height = image.Size.Y;

  const r = math.floor(color.R * 255);
  const g = math.floor(color.G * 255);
  const b = math.floor(color.B * 255);
  const colorBits = (b << 16) | (g << 8) | r;

  /* Draw pixel function */
  const setPixelSafe = (x: number, y: number, opacity: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    const memoryPos = 4 * (y * width + x);
    const pixel = (opacity << 24) | colorBits;
    buffer.writeu32(imageBuffer, memoryPos, pixel);
  };

  for (const i of $range(0, GRADIENT_SIZE, 0.05)) {
    const percentage = i / GRADIENT_SIZE;
    let point = spline.CalculatePositionAt(percentage) as Vector2;

    const x = math.floor(
      AsPosition(domainRange.DomainMin, domainRange.DomainMax, point.X) * width,
    );
    const y = math.floor(
      AsPosition(domainRange.RangeMin, domainRange.RangeMax, point.Y, true) *
        height,
    );

    setPixelSafe(x, y, 255);
  }
}
export function EditableImageSplineGradients(props: {
  Data: GraphData;
  domainRange: DomainRange;
}) {
  const [gradientImage] = useState(
    AssetService.CreateEditableImage({
      Size: new Vector2(GRADIENT_SIZE, GRADIENT_SIZE),
    }),
  );

  const [splines, setSplines] = useState<SplineData>({});

  /* recompute splines with data */
  useEffect(() => {
    const newSplines: SplineData = {};
    for (const [index, data] of pairs(props.Data)) {
      const positions = Object.entries(data.data).map(
        ([x, y]) => new Vector2(x, y),
      );
      newSplines[data.name] = {
        index,
        spline: new CatmullRomSpline(positions),
      };
    }
    setSplines(newSplines);
  }, [props.Data]);

  /* rerender */
  useEffect(() => {
    const resolution = gradientImage.Size;

    /* compute new buffer */
    const gradientBuffer = gradientImage.ReadPixelsBuffer(
      Vector2.zero,
      resolution,
    );

    /* draw lines */
    for (const [name, spline] of pairs(splines)) {
      DrawSplineGradient(
        gradientImage,
        gradientBuffer,
        spline.spline,
        props.domainRange,
        GetKeyColor(spline.index),
      );
    }

    /* write */
    gradientImage.WritePixelsBuffer(Vector2.zero, resolution, gradientBuffer);

    /* clear image
    return () => {
      gradientImage.DrawRectangle(
        Vector2.zero,
        resolution,
        new Color3(),
        255,
        "Overwrite",
      );
    };*/
  }, [props.domainRange, splines]);

  return (
    <imagelabel
      BackgroundTransparency={1}
      Size={new UDim2(1, 0, 1, 0)}
      ImageContent={Content.fromObject(gradientImage)}
    />
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
        Size={new UDim2(0, distance + 5, 0, px(LINE_WIDTH))}
        Position={new UDim2(0, (startX + endX) / 2, 0, (startY + endY) / 2)}
      />
    </>
  );
}
export function EditableImageSplineLines(props: {
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
  return lines;
}
