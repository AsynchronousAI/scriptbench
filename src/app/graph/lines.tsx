import React, { InstanceEvent, ReactNode, RefObject } from "@rbxts/react";

import { useEffect, useState } from "@rbxts/react";
import { DomainRange, GraphData } from "./types";
import { AssetService } from "@rbxts/services";
import { AsPosition, forEachLine } from "./computation";
import { usePx } from "hooks/usePx";
import { GraphAtoms } from "./atoms";
import { LINE_WIDTH } from "configurations";

/* Main */
const GRADIENT_SIZE = 256;

/* Precompute gradient */
const gradientLUT: number[] = table.create(GRADIENT_SIZE);
for (let i = 0; i < GRADIENT_SIZE; i++) {
  /* linear gradient (0.9 -> 0.1) */
  gradientLUT[i] = math.floor(
    (((GRADIENT_SIZE - i - 1) / (GRADIENT_SIZE - 1)) * 0.8 + 0.1) * 255,
  );
}

/* Gradient */
function DrawLineGradient(
  image: EditableImage,
  imageBuffer: buffer,
  startPos: Vector2,
  endPos: Vector2,
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

  /* Bresenham Algorithm */
  let x0 = math.floor(startPos.X);
  let y0 = math.floor(startPos.Y);
  const x1 = math.floor(endPos.X);
  const y1 = math.floor(endPos.Y);

  const dx = math.abs(x1 - x0);
  const dy = math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    for (let i = y0; i < height; i++) {
      setPixelSafe(x0, i, gradientLUT[i]);
    }

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}
export function EditableImageGradients(props: {
  Data: GraphData;
  domainRange: DomainRange;
}) {
  const [gradientImage] = useState(
    AssetService.CreateEditableImage({
      Size: new Vector2(GRADIENT_SIZE, GRADIENT_SIZE),
    }),
  );

  useEffect(() => {
    const resolution = gradientImage.Size;

    /* compute new buffer */
    const gradientBuffer = gradientImage.ReadPixelsBuffer(
      Vector2.zero,
      resolution,
    );

    /* draw lines */
    forEachLine(props.Data, (x, y, nextX, nextY, data, color, index) => {
      let start = new Vector2(
        AsPosition(props.domainRange.DomainMin, props.domainRange.DomainMax, x),
        AsPosition(
          props.domainRange.RangeMin,
          props.domainRange.RangeMax,
          y,
          true,
        ),
      ).mul(resolution);
      let end_ = new Vector2(
        AsPosition(
          props.domainRange.DomainMin,
          props.domainRange.DomainMax,
          nextX,
        ),
        AsPosition(
          props.domainRange.RangeMin,
          props.domainRange.RangeMax,
          nextY,
          true,
        ),
      ).mul(resolution);

      DrawLineGradient(gradientImage, gradientBuffer, start, end_, color);
    });
    /* write */
    gradientImage.WritePixelsBuffer(Vector2.zero, resolution, gradientBuffer);

    /* clear image */
    return () => {
      gradientImage.WritePixelsBuffer(
        Vector2.zero,
        resolution,
        buffer.create(buffer.len(gradientBuffer)),
      );
    };
  }, [props.domainRange, props.Data]);

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
  return lines;
}
