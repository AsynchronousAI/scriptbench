import React, { useRef } from "@rbxts/react";
import { COLORS } from "colors";
import { usePx } from "hooks/usePx";
import { Lines } from "./lines";
import { Labels } from "./labels";
import { AsPosition, ComputeRangeDomain, GetKeyColor } from "./computation";
import { LABEL_THICKNESS, LINE_WIDTH } from "configurations";

/** Types */
export type GraphData = { [key: string]: { [key: number]: number } };
export interface GraphProps {
  Data: GraphData;
  HighlightedX?: { [key: string]: number };
  XPrefix?: string;
  YPrefix?: string;
}
export interface DomainRange {
  DomainMin: number;
  DomainMax: number;
  RangeMin: number;
  RangeMax: number;
  Range: number;
  Domain: number;
}

/** React Components */
function HighlightedX(props: {
  HighlightedX: { [key: string]: number };
  domainRange: DomainRange;
}) {
  const px = usePx();
  const { DomainMin, DomainMax } = props.domainRange;

  let highlights = [];
  for (const [key, value] of pairs(props.HighlightedX)) {
    const [color] = GetKeyColor(key as string);

    highlights.push(
      <frame
        Position={new UDim2(AsPosition(DomainMin, DomainMax, value), 0, 0.5, 0)}
        AnchorPoint={new Vector2(0, 0.5)}
        Size={new UDim2(0, px(LINE_WIDTH), 1, 0)}
        BackgroundColor3={color}
        BackgroundTransparency={0.5}
      />,
    );
  }
  return highlights;
}

/* Main */
export default function Graph(props: GraphProps) {
  const domainRange = ComputeRangeDomain(props.Data);

  const containerRef = useRef<Frame>(undefined);

  return (
    <frame
      Size={new UDim2(0.975, 0, 0.975, 0)}
      BackgroundColor3={COLORS.Background}
      Position={new UDim2(0.5, 0, 0.5, 0)}
      AnchorPoint={new Vector2(0.5, 0.5)}
      BorderSizePixel={0}
    >
      <frame
        Size={new UDim2(1 - LABEL_THICKNESS * 2, 0, 1 - LABEL_THICKNESS * 2, 0)}
        BackgroundTransparency={1}
        Position={new UDim2(0.5, 0, 0.5, 0)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        ref={containerRef}
      >
        {props.HighlightedX && (
          <HighlightedX
            HighlightedX={props.HighlightedX}
            domainRange={domainRange}
          />
        )}
        <Lines
          Data={props.Data}
          domainRange={domainRange}
          Container={containerRef}
        />
        <Labels
          domainRange={domainRange}
          XPrefix={props.XPrefix}
          YPrefix={props.YPrefix}
        />
      </frame>
    </frame>
  );
}
