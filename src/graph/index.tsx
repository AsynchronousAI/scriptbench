import { Object } from "@rbxts/luau-polyfill";
import React, {
  InstanceEvent,
  RefObject,
  useRef,
  useState,
} from "@rbxts/react";
import { COLORS, Theme } from "colors";
import { usePx } from "hooks/usePx";

/** Types */
export type GraphData = { [key: string]: { [key: number]: number } };
export interface GraphProps {
  Data: GraphData;
  HighlightedX?: { [key: string]: number };
  XPrefix?: string;
  YPrefix?: string;
}
interface DomainRange {
  DomainMin: number;
  DomainMax: number;
  RangeMin: number;
  RangeMax: number;
  Range: number;
  Domain: number;
}

/** Configurations */
const LABEL_THICKNESS = 0.075;
const DOMAIN_LABELS = 5;
const RANGE_LABELS = 5;
const LINE_WIDTH = 2.5;
const LABEL_TEXT_SIZE = 16;

/** Computations */
function AsPosition(Min: number, Max: number, Value: number, IsRange = false) {
  const value = math.map(Value, Min, Max, 0, 1);

  if (IsRange) {
    return 1 - value;
  }
  return value;
}
function FromPosition(
  Min: number,
  Max: number,
  Value: number,
  IsRange = false,
) {
  if (IsRange) {
    Value = 1 - Value;
  }

  const value = math.map(Value, 0, 1, Min, Max);

  return math.max(value, 0);
}
export function FormatNumber(value: number, prefix?: string): string {
  return string.format("%.2f", value) + (prefix || "");
}
function ComputeRangeDomain(
  data: {
    [key: string]: { [key: number]: number };
  },
  baseline: number = 0 /* set to math.huge to disable */,
): DomainRange {
  let domainMin = math.huge;
  let domainMax = -math.huge;
  let rangeMin = math.huge;
  let rangeMax = -math.huge;

  for (const series of Object.values(data)) {
    for (const [domain, range] of Object.entries(series)) {
      domainMin = math.min(domainMin, domain);
      domainMax = math.max(domainMax, domain);
      rangeMin = math.min(rangeMin, range);
      rangeMax = math.max(rangeMax, range);
    }
  }

  return {
    DomainMin: domainMin,
    DomainMax: domainMax,
    RangeMin: math.min(rangeMin, baseline),
    RangeMax: rangeMax,
    Domain: domainMax - domainMin,
    Range: rangeMax - rangeMin,
  };
}
function InIncrements(Min: number, Max: number, Range: number, Amount: number) {
  let increment = Range / Amount;
  let increments = [];
  for (let i = Min; i <= Max; i += increment) {
    increments.push(i);
  }
  return increments;
}
export function GetKeyColor(name: string): [Color3, number] {
  const isDark = Theme.Name === "Dark";

  let seed = 0;
  for (let i = 0; i < name.size(); i++) {
    seed += name.byte(i + 1) as unknown as number;
  }
  const rng = new Random(seed);
  const hue = rng.NextInteger(0, 150) / 150;
  return [Color3.fromHSV(hue, isDark ? 0.63 : 1, isDark ? 0.84 : 0.8), seed];
}

/** React Components */
function TagsAndGridLines(props: {
  DomainMin: number;
  DomainMax: number;
  Domain: number;
  RangeMin: number;
  RangeMax: number;
  Range: number;
  XPrefix?: string;
  YPrefix?: string;
}) {
  const px = usePx();

  return (
    <>
      {/* Domain tags + grid lines */}
      {InIncrements(
        props.DomainMin,
        props.DomainMax,
        props.Domain,
        DOMAIN_LABELS,
      ).map((value, index) => {
        return (
          <>
            <textlabel
              Font={Enum.Font.Code}
              Text={FormatNumber(value, props.XPrefix)}
              Size={new UDim2(LABEL_THICKNESS, 0, LABEL_THICKNESS, 0)}
              Position={
                new UDim2(
                  AsPosition(props.DomainMin, props.DomainMax, value) -
                    LABEL_THICKNESS / 2,
                  0,
                  1,
                  0,
                )
              }
              BackgroundTransparency={1}
              TextColor3={COLORS.Text}
              TextSize={px(LABEL_TEXT_SIZE)}
              TextXAlignment="Center"
              TextYAlignment="Center"
            />
            <frame
              Size={new UDim2(0, 1, 1, 0)}
              Position={
                new UDim2(
                  AsPosition(props.DomainMin, props.DomainMax, value),
                  0,
                  0,
                  0,
                )
              }
              BackgroundColor3={COLORS.Border}
              BorderSizePixel={0}
              ZIndex={1}
            />
          </>
        );
      })}
      {/* Range tags + grid lines */}
      {InIncrements(
        props.RangeMin,
        props.RangeMax,
        props.Range,
        RANGE_LABELS,
      ).map((value) => {
        return (
          <>
            <textlabel
              Font={Enum.Font.Code}
              Text={FormatNumber(value, props.YPrefix)}
              Size={new UDim2(LABEL_THICKNESS, 0, LABEL_THICKNESS, 0)}
              Position={
                new UDim2(
                  -LABEL_THICKNESS,
                  0,
                  AsPosition(props.RangeMin, props.RangeMax, value, true) -
                    LABEL_THICKNESS / 2,
                  0,
                )
              }
              BackgroundTransparency={1}
              TextColor3={COLORS.Text}
              TextSize={px(LABEL_TEXT_SIZE)}
              TextXAlignment="Center"
              TextYAlignment="Center"
            />
            <frame
              Size={new UDim2(1, 0, 0, 1)}
              Position={
                new UDim2(
                  0,
                  0,
                  AsPosition(props.RangeMin, props.RangeMax, value, true),
                  0,
                )
              }
              BackgroundColor3={COLORS.Border}
              BorderSizePixel={0}
              ZIndex={1}
            />
          </>
        );
      })}
    </>
  );
}
function HighlightedX(props: {
  HighlightedX: { [key: string]: number };
  DomainMin: number;
  DomainMax: number;
}) {
  const px = usePx();

  let highlights = [];
  for (const [key, value] of pairs(props.HighlightedX)) {
    const [color] = GetKeyColor(key as string);

    highlights.push(
      <frame
        Position={
          new UDim2(
            AsPosition(props.DomainMin, props.DomainMax, value),
            0,
            0.5,
            0,
          )
        }
        AnchorPoint={new Vector2(0, 0.5)}
        Size={new UDim2(0, px(LINE_WIDTH), 1, 0)}
        BackgroundColor3={color}
        BackgroundTransparency={0.5}
      />,
    );
  }
  return highlights;
}
function Line(props: {
  Container?: RefObject<Frame>;

  /* line attr */
  StartX: number;
  StartY: number;
  EndX: number;
  EndY: number;
  Color: Color3;
  Name: string;
  ZIndex: number;

  /* graph attr */
  DomainMin: number;
  DomainMax: number;
  RangeMin: number;
  RangeMax: number;
}) {
  const px = usePx();
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  const Events = {
    MouseEnter: () => {
      setShowLabel(true);
    },
    MouseLeave: () => {
      setShowLabel(false);
    },
    MouseMoved: (_: Instance, mouseX: number, mouseY: number) => {
      const container = props.Container?.current;
      if (!container) return;

      const guiX = container.AbsolutePosition.X;
      const guiY = container.AbsolutePosition.Y;
      const guiSizeX = container.AbsoluteSize.X;
      const guiSizeY = container.AbsoluteSize.Y;

      setX((mouseX - guiX) / guiSizeX);
      setY((mouseY - guiY) / guiSizeY);
    },
  } as unknown as InstanceEvent<Frame>;

  return (
    <>
      {/* Label */}
      <frame
        Visible={showLabel}
        Size={new UDim2(0.15, 0, 0.15, 0)}
        BackgroundColor3={COLORS.LightBackground}
        BorderColor3={COLORS.Border}
        Position={new UDim2(x, 0, y, 0)}
        ZIndex={props.ZIndex + 1}
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
          ZIndex={props.ZIndex + 2}
          RichText
          Text={`<b><font color="#${props.Color.ToHex()}">${props.Name}</font></b>
${FormatNumber(FromPosition(props.DomainMin, props.DomainMax, x))}µs
${math.floor(FromPosition(props.RangeMin, props.RangeMax, y, true))} Calls`}
        />
      </frame>

      {/* Travel across X */}
      <frame
        BorderSizePixel={0}
        BackgroundColor3={props.Color}
        ZIndex={props.ZIndex}
        Event={Events}
        Size={
          new UDim2(
            AsPosition(props.DomainMin, props.DomainMax, props.EndX) -
              AsPosition(props.DomainMin, props.DomainMax, props.StartX),
            px(LINE_WIDTH),
            0,
            px(LINE_WIDTH),
          )
        }
        Position={
          new UDim2(
            AsPosition(props.DomainMin, props.DomainMax, props.StartX),
            0,
            AsPosition(props.RangeMin, props.RangeMax, props.StartY, true),
            0,
          )
        }
      />

      {/* Travel across Y */}
      <frame
        BorderSizePixel={0}
        BackgroundColor3={props.Color}
        ZIndex={props.ZIndex}
        Event={Events}
        Size={
          new UDim2(
            0,
            px(LINE_WIDTH),
            AsPosition(props.RangeMin, props.RangeMax, props.EndY) -
              AsPosition(props.RangeMin, props.RangeMax, props.StartY),
            0,
          )
        }
        Position={
          new UDim2(
            AsPosition(props.DomainMin, props.DomainMax, props.EndX),
            0,
            AsPosition(props.RangeMin, props.RangeMax, props.EndY, true),
            0,
          )
        }
      />

      {/* Gradient */}
      <frame
        BorderSizePixel={0}
        BackgroundColor3={props.Color}
        ZIndex={props.ZIndex}
        Size={
          new UDim2(
            AsPosition(props.DomainMin, props.DomainMax, props.StartX) -
              AsPosition(props.DomainMin, props.DomainMax, props.EndX),
            0,
            AsPosition(props.RangeMin, props.RangeMax, props.StartY),
            0,
          )
        }
        Position={
          new UDim2(
            AsPosition(props.DomainMin, props.DomainMax, props.EndX),
            0,
            AsPosition(props.RangeMin, props.RangeMax, props.StartY, true),
            0,
          )
        }
      >
        <uigradient
          Rotation={90}
          Transparency={
            new NumberSequence([
              new NumberSequenceKeypoint(
                0,
                1 - AsPosition(props.RangeMin, props.RangeMax, props.StartY),
              ),
              new NumberSequenceKeypoint(1, 1),
            ])
          }
        />
      </frame>
    </>
  );
}
function Lines(props: {
  Data: GraphData;
  DomainMin: number;
  DomainMax: number;
  RangeMin: number;
  RangeMax: number;
  Container?: RefObject<Frame>;
}) {
  const allXSet = new Set<number>();
  for (const series of Object.values(props.Data)) {
    for (const x of Object.keys(series)) {
      allXSet.add(tonumber(x) as number);
    }
  }
  const allX = [...allXSet];
  allX.sort((a, b) => a < b);

  let lines = [];
  for (const [key, points] of pairs(props.Data)) {
    const [color, seed] = GetKeyColor(key as string);

    let prevY: number | undefined = undefined;
    for (let i = 0; i < allX.size(); i++) {
      const x = allX[i];
      const nextX = allX[i + 1];
      if (nextX === undefined) continue;

      const y = (points[x] ? points[x] : prevY ? prevY : 0) as number;
      const nextY = points[nextX] !== undefined ? points[nextX] : y;

      prevY = y;

      lines.push(
        <Line
          Name={key as string}
          StartX={x}
          Container={props.Container}
          StartY={y}
          EndX={nextX}
          EndY={nextY}
          Color={color}
          DomainMax={props.DomainMax}
          DomainMin={props.DomainMin}
          RangeMax={props.RangeMax}
          RangeMin={props.RangeMin}
          ZIndex={seed}
        />,
      );
    }
  }
  return lines;
}

/* Main */
export default function ReactGraph(props: GraphProps) {
  let { Domain, DomainMin, DomainMax, Range, RangeMin, RangeMax } =
    ComputeRangeDomain(props.Data);

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
            DomainMax={DomainMax}
            DomainMin={DomainMin}
          />
        )}
        <Lines
          Data={props.Data}
          DomainMax={DomainMax}
          DomainMin={DomainMin}
          RangeMax={RangeMax}
          RangeMin={RangeMin}
          Container={containerRef}
        />
        <TagsAndGridLines
          RangeMin={RangeMin}
          RangeMax={RangeMax}
          Range={Range}
          DomainMin={DomainMin}
          DomainMax={DomainMax}
          Domain={Domain}
          XPrefix={props.XPrefix}
          YPrefix={props.YPrefix}
        />
      </frame>
    </frame>
  );
}
