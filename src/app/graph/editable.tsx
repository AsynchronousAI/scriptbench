import React, { useEffect, useRef, useState } from "@rbxts/react";
import { COLORS, GetKeyColor } from "colors";
import { usePx } from "hooks/usePx";
import { Lines } from "./lines";
import { Labels } from "./labels";
import {
  useDomainRange,
  FormatNumber,
  FromPosition,
  AsPosition,
} from "./computation";
import { LABEL_THICKNESS, LINE_WIDTH } from "configurations";
import { useAtom } from "@rbxts/react-charm";
import { GraphAtoms } from "app/graph/atoms";
import { Button, ScrollFrame } from "@rbxts/studiocomponents-react2";
import { DomainRange, GraphData, GraphProps } from "./types";
import { AssetService } from "@rbxts/services";
import { Object } from "@rbxts/luau-polyfill";

/* Main */
const THICKNESS = 0;
function DrawLine(
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

  /* Precompute gradient */
  const gradientLUT: number[] = table.create(height);
  for (let i = 0; i < height; i++) {
    gradientLUT[i] = math.floor(math.max(0, math.min(1, 1 - i / height)) * 255);
  }

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
      const isLine = i < y0 + THICKNESS;
      if (!isLine) {
        setPixelSafe(x0, i, gradientLUT[i]);
      }
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

function EditableImage(props: { Data: GraphData; domainRange: DomainRange }) {
  const [image, setImage] = useState(
    AssetService.CreateEditableImage({ Size: new Vector2(512, 512) }),
  );
  useEffect(() => {
    const resolution = image.Size;

    /* format into a Set */
    const allXSet = new Set<number>();
    for (const series of Object.values(props.Data)) {
      for (const x of Object.keys(series.data)) {
        allXSet.add(tonumber(x) as number);
      }
    }
    const allX = [...allXSet];
    allX.sort((a, b) => a < b);

    /* compute new buffer */
    const buffer = image.ReadPixelsBuffer(Vector2.zero, image.Size);
    for (const [index, data] of pairs(props.Data)) {
      const color = GetKeyColor(index);

      let prevY: number | undefined = undefined;
      for (let i = 0; i < allX.size(); i++) {
        const x = allX[i];
        const nextX = allX[i + 1];
        if (nextX === undefined) continue;

        const y = (data.data[x] ? data.data[x] : prevY ? prevY : 0) as number;
        const nextY = data.data[nextX] !== undefined ? data.data[nextX] : y;

        prevY = y;

        let start = new Vector2(
          AsPosition(
            props.domainRange.DomainMin,
            props.domainRange.DomainMax,
            x,
          ),
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

        DrawLine(image, buffer, start, end_, color);
      }
    }

    /* write */
    image.WritePixelsBuffer(Vector2.zero, image.Size, buffer);

    /* clear image */
    return () => {
      image.DrawRectangle(
        new Vector2(0, 0),
        new Vector2(resolution.X, resolution.Y),
        new Color3(0, 0),
        1,
        Enum.ImageCombineType.Overwrite,
      );
    };
  });

  return (
    <imagelabel
      BackgroundTransparency={1}
      Size={new UDim2(1, 0, 1, 0)}
      ImageContent={Content.fromObject(image)}
    />
  );
}

/* wrapper which uses the default elements */
export default function EditableImageGraph(props: GraphProps) {
  const domainRange = useDomainRange(props.Data);
  const px = usePx();
  const zoom = useAtom(GraphAtoms.zoom);
  const fakeScrollObject = useRef<Frame>();

  const hoveringLine = useAtom(GraphAtoms.hoveringLine);
  const lineTime =
    hoveringLine &&
    FormatNumber(
      FromPosition(
        domainRange.DomainMin,
        domainRange.DomainMax,
        hoveringLine.position.X,
      ),
    );
  const lineCalls =
    hoveringLine &&
    math.floor(
      FromPosition(
        domainRange.RangeMin,
        domainRange.RangeMax,
        hoveringLine.position.Y,
        true,
      ),
    );

  const containerRef = useRef<Frame>(undefined);

  return (
    <frame
      Size={new UDim2(0.985, 0, 1, 0)}
      BackgroundColor3={COLORS.Background}
      Position={new UDim2(0.5, 0, 0.5, 0)}
      AnchorPoint={new Vector2(0.5, 0.5)}
      BorderSizePixel={0}
      ClipsDescendants
    >
      <Button
        ZIndex={2}
        Icon={{
          Image: "rbxassetid://12072054746",
          Size: Vector2.one.mul(24),
          UseThemeColor: true,
          Alignment: Enum.HorizontalAlignment.Left,
        }}
        Size={new UDim2(0, px(25), 0, px(25))}
        Position={new UDim2(0.95, 0, 0.5, px(-15))}
        AnchorPoint={new Vector2(0.5, 0.5)}
        OnActivated={() => GraphAtoms.zoom((r) => r + 1)}
      />
      <Button
        ZIndex={2}
        Icon={{
          Image: "rbxassetid://15396333997",
          Size: Vector2.one.mul(24),
          UseThemeColor: true,
          Alignment: Enum.HorizontalAlignment.Left,
        }}
        Size={new UDim2(0, px(25), 0, px(25))}
        Position={new UDim2(0.95, 0, 0.5, px(15))}
        AnchorPoint={new Vector2(0.5, 0.5)}
        OnActivated={() => GraphAtoms.zoom((r) => math.max(r - 1, 1))}
      />

      {/* Scrolling */}
      <ScrollFrame
        ScrollingDirection={Enum.ScrollingDirection.X}
        Size={new UDim2(0.925 - LABEL_THICKNESS / 2, 0, 0.95, 0)}
        Position={new UDim2(0.48 + LABEL_THICKNESS / 2, 0, 0.5, 0)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        BorderSizePixel={0}
        OnScrolled={(pos) => {
          const fakeScroller = fakeScrollObject.current;
          if (!fakeScroller) return;

          const max = fakeScroller.AbsoluteSize.X;
          const percent = math.map(pos.X, 0, max, 0, 1);
          GraphAtoms.focusedX(percent * domainRange.Domain);
        }}
      >
        <frame
          Size={new UDim2(zoom, 0, 1, 0)}
          BackgroundTransparency={1}
          ref={fakeScrollObject}
        />
      </ScrollFrame>

      <frame
        Size={new UDim2(1 - LABEL_THICKNESS * 2, 0, 1 - LABEL_THICKNESS * 2, 0)}
        BackgroundTransparency={1}
        Position={new UDim2(0.5, 0, 0.45, 0)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        ref={containerRef}
        Event={{
          MouseMoved: (_: Instance, mouseX, mouseY) => {
            const container = containerRef?.current;
            if (!container) return;

            const guiX = container.AbsolutePosition.X;
            const guiY = container.AbsolutePosition.Y;
            const guiSizeX = container.AbsoluteSize.X;
            const guiSizeY = container.AbsoluteSize.Y;

            GraphAtoms.hoveringLine((current) => ({
              text: current?.text,
              position: new Vector2(
                (mouseX - guiX) / guiSizeX,
                (mouseY - guiY) / guiSizeY,
              ),
              color: current?.color ?? new Color3(),
            }));
          },
        }}
      >
        <Labels
          domainRange={domainRange}
          XPrefix={props.XPrefix}
          YPrefix={props.YPrefix}
        />
        <EditableImage Data={props.Data} domainRange={domainRange} />

        {/* Hover Label
        {hoveringLine && (
          <frame
            Size={new UDim2(0.1, 0, hoveringLine.text ? 0.15 : 0.1, 0)}
            BackgroundColor3={COLORS.LightBackground}
            BorderColor3={COLORS.Border}
            Position={
              new UDim2(
                hoveringLine.position.X ?? 0,
                0,
                hoveringLine.position.Y ?? 0,
                0,
              )
            }
            ZIndex={math.huge}
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
              RichText
              Text={
                (hoveringLine.text
                  ? `<b><font color="#${hoveringLine.color.ToHex()}">${hoveringLine.text}</font></b>\n`
                  : ``) + `${lineTime}µs\n${lineCalls} Calls`
              }
            />
          </frame>
          )}*/}
      </frame>
    </frame>
  );
}
