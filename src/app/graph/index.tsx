import React, { useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { COLORS, GetKeyColor } from "colors";
import { usePx } from "hooks/usePx";
import { Labels } from "./labels";
import { useDomainRange, FormatNumber, FromPosition } from "./computation";
import { LABEL_THICKNESS, LINE_WIDTH } from "configurations";
import { useAtom } from "@rbxts/react-charm";
import { GraphAtoms } from "app/graph/atoms";
import { Button, ScrollFrame } from "@rbxts/studiocomponents-react2";
import { GraphData, GraphingMode } from "./types";
import { EditableImage } from "./editableImage";
import { Steps } from "./steps";

/* Main */
export interface GraphProps {
  Data: GraphData;
  Mode: GraphingMode;
  XPrefix?: string;
  YPrefix?: string;
}
export default function Graph(props: GraphProps) {
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
        Size={new UDim2(1 - LABEL_THICKNESS * 2, 0, 0.95, 0)}
        Position={new UDim2(0.5, 0, 0.5, 0)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        BorderSizePixel={0}
        OnScrolled={(pos) => {
          const fakeScroller = fakeScrollObject.current;
          if (!fakeScroller) return;

          const max = fakeScroller.AbsoluteSize.X;
          const percent = math.map(pos.X, 0, max, 0, 1);

          const newVal = percent * domainRange.Domain;
          GraphAtoms.focusedX(newVal);
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
          GridLines
        />
        {props.Mode !== GraphingMode.Steps ? (
          <EditableImage
            Mode={props.Mode}
            Data={props.Data}
            domainRange={domainRange}
          />
        ) : (
          <Steps
            Data={props.Data}
            domainRange={domainRange}
            Container={containerRef}
          />
        )}

        {/* Trims */}
        <frame
          Size={new UDim2(1, 0, 1, 0)}
          Position={new UDim2(-1, 0, 0, 0)}
          BackgroundColor3={COLORS.Background}
          BorderSizePixel={0}
          ZIndex={2}
        />
        <frame
          Size={new UDim2(1, 0, 1, 0)}
          Position={new UDim2(1, 0, 0, 0)}
          BackgroundColor3={COLORS.Background}
          BorderSizePixel={0}
          ZIndex={2}
        />

        {/* Hover Label */}
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
        )}
      </frame>
    </frame>
  );
}

export * from "./types";
