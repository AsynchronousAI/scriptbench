import { Object } from "@rbxts/luau-polyfill";
import React, { ReactNode, useBinding } from "@rbxts/react";
import { COLORS } from "colors";
import { usePx } from "hooks/usePx";

/** Types */
export interface Theme {
  Name?: string;
  Background?: Color3;
  LightBackground?: Color3;
  Text?: Color3;
}
export interface GraphProps {
  Resolution: number;
  Data: { [key: string]: { [key: number]: number } };
  Theme?: Theme;
  HighlightedX?: { [key: string]: number };
}

/** Configurations */
const LABEL_THICKNESS = 0.075;
const DOMAIN_LABELS = 5;
const RANGE_LABELS = 5;

/** Computations */
function AsPosition(Min: number, Max: number, Value: number, IsRange = false) {
  const value = (Value - Min) / (Max - Min);
  if (IsRange) {
    return 1 - value;
  }
  return value;
}
function FormatNumber(value: number): string {
  return string.format("%.2f", value);
}
function ComputeRangeDomain(data: {
  [key: string]: { [key: number]: number };
}): {
  DomainMin: number;
  DomainMax: number;
  RangeMin: number;
  RangeMax: number;
  Range: number;
  Domain: number;
} {
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
    RangeMin: rangeMin,
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
function GetKeyColor(name: string, isDark: boolean = true) {
  let seed = 0;
  for (let i = 0; i < name.size(); i++) {
    seed += name.byte(i + 1)[0];
  }
  const rng = new Random(seed);
  const hue = rng.NextInteger(0, 50) / 50;
  return Color3.fromHSV(hue, isDark ? 0.9 : 1, isDark ? 0.84 : 0.8);
}

/** React Components */
function AxisBorders() {
  return (
    <>
      <frame /* Y */
        Size={new UDim2(LABEL_THICKNESS, 0, 1, 0)}
        Position={new UDim2(0, 0, -LABEL_THICKNESS, 0)}
        BackgroundColor3={COLORS.LightBackground}
        BorderColor3={COLORS.Border}
      />
      <frame /* X */
        Size={new UDim2(1 - LABEL_THICKNESS, -1, LABEL_THICKNESS, 0)}
        Position={new UDim2(LABEL_THICKNESS, 1, 1 - LABEL_THICKNESS, 0)}
        BackgroundColor3={COLORS.LightBackground}
        BorderColor3={COLORS.Border}
      />
      <frame /* Center */
        Size={new UDim2(LABEL_THICKNESS, 1, LABEL_THICKNESS, 1)}
        Position={new UDim2(0, 0, 1 - LABEL_THICKNESS, 0)}
        BackgroundColor3={COLORS.LightBackground}
        BorderSizePixel={0}
      />
    </>
  );
}
function TagsAndGridLines(props: {
  DomainMin: number;
  DomainMax: number;
  Domain: number;
  RangeMin: number;
  RangeMax: number;
  Range: number;
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
      ).map((value) => {
        return (
          <>
            <textlabel
              Text={FormatNumber(value)}
              Size={new UDim2(LABEL_THICKNESS, 0, LABEL_THICKNESS, 0)}
              Position={
                new UDim2(
                  AsPosition(props.DomainMin, props.DomainMax, value) +
                    LABEL_THICKNESS / 2,
                  0,
                  1 - LABEL_THICKNESS,
                  0,
                )
              }
              BackgroundTransparency={1}
              TextColor3={COLORS.Text}
              TextSize={px(10)}
              TextXAlignment="Center"
              TextYAlignment="Center"
            />
            <frame
              Size={new UDim2(0, 1, 1, 0)}
              Position={
                new UDim2(
                  AsPosition(props.DomainMin, props.DomainMax, value) +
                    LABEL_THICKNESS,
                  0,
                  -LABEL_THICKNESS,
                  0,
                )
              }
              BackgroundColor3={COLORS.Border}
              BorderSizePixel={0}
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
              Text={FormatNumber(value)}
              Size={new UDim2(LABEL_THICKNESS, 0, LABEL_THICKNESS, 0)}
              Position={
                new UDim2(
                  0,
                  0,
                  AsPosition(props.RangeMin, props.RangeMax, value, true),
                  0,
                )
              }
              BackgroundTransparency={1}
              TextColor3={COLORS.Text}
              TextSize={px(10)}
              TextXAlignment="Center"
              TextYAlignment="Center"
            />
            <frame
              Size={new UDim2(1, 0, 0, 1)}
              Position={
                new UDim2(
                  LABEL_THICKNESS,
                  0,
                  AsPosition(props.RangeMin, props.RangeMax, value, true) +
                    LABEL_THICKNESS / 2,
                  0,
                )
              }
              BackgroundColor3={COLORS.Border}
              BorderSizePixel={0}
            />
          </>
        );
      })}
    </>
  );
}
function Points(props: {
  Data: { [key: string]: { [key: number]: number } };
  RangeMin: number;
  RangeMax: number;
  DomainMin: number;
  DomainMax: number;
}) {
  const px = usePx();

  return (
    <>
      {Object.keys(props.Data).map((name) => {
        const data = props.Data[name];
        const color = GetKeyColor(name as string);

        let result = [];

        for (const [xV, yV] of pairs(data)) {
          const [isHovering, setIsHovering] = useBinding(false);
          result.push(
            <>
              {/* The point itself */}
              <frame
                Size={new UDim2(0, px(7), 0, px(7))}
                BackgroundColor3={color}
                BorderSizePixel={0}
                Event={{
                  MouseEnter: () => setIsHovering(true),
                  MouseLeave: () => setIsHovering(false),
                }}
                Position={
                  new UDim2(
                    AsPosition(props.DomainMin, props.DomainMax, xV) +
                      LABEL_THICKNESS,
                    0,
                    AsPosition(props.RangeMin, props.RangeMax, yV, true),
                    0,
                  )
                }
              >
                <uiaspectratioconstraint />
                <uicorner CornerRadius={new UDim(1, 0)} />
              </frame>

              {/* Label, appears when hovering */}
              <frame
                Visible={isHovering}
                Size={new UDim2(0.1, 0, 0.1, 0)}
                BackgroundColor3={COLORS.LightBackground}
                BorderColor3={COLORS.Border}
                Position={
                  new UDim2(
                    AsPosition(props.DomainMin, props.DomainMax, xV) +
                      LABEL_THICKNESS,
                    10,
                    AsPosition(props.RangeMin, props.RangeMax, yV, true),
                    10,
                  )
                }
              >
                <uipadding
                  PaddingTop={new UDim(0.3, 0)}
                  PaddingBottom={new UDim(0.3, 0)}
                />
                <textlabel
                  Size={new UDim2(1, 0, 1, 0)}
                  BackgroundTransparency={1}
                  TextColor3={COLORS.FocusText}
                  TextScaled
                  Text={`(${xV}, ${yV})`}
                />
              </frame>
            </>,
          );
        }
        return result;
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
    const color = GetKeyColor(key as string);

    highlights.push(
      <frame
        Position={
          new UDim2(
            AsPosition(props.DomainMin, props.DomainMax, value) +
              LABEL_THICKNESS / 2,
            0,
            0.5 - LABEL_THICKNESS,
            0,
          )
        }
        AnchorPoint={new Vector2(0, 0.5)}
        Size={new UDim2(0, px(5), 1, 0)}
        BackgroundColor3={color}
        BackgroundTransparency={0.5}
      />,
    );
  }
  return highlights;
}

/* Main */
export default function ReactGraph(props: GraphProps) {
  let { Domain, DomainMin, DomainMax, Range, RangeMin, RangeMax } =
    ComputeRangeDomain(props.Data);
  const px = usePx();

  return (
    <frame Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={COLORS.Background}>
      <AxisBorders />
      <TagsAndGridLines
        RangeMin={RangeMin}
        RangeMax={RangeMax}
        Range={Range}
        DomainMin={DomainMin}
        DomainMax={DomainMax}
        Domain={Domain}
      />
      <Points
        Data={props.Data}
        DomainMax={DomainMax}
        DomainMin={DomainMin}
        RangeMax={RangeMax}
        RangeMin={RangeMin}
      />
      {props.HighlightedX && (
        <HighlightedX
          HighlightedX={props.HighlightedX}
          DomainMax={DomainMax}
          DomainMin={DomainMin}
        />
      )}
    </frame>
  );
}
