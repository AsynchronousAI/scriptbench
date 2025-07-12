import { Object } from "@rbxts/luau-polyfill";
import React, { ReactNode } from "@rbxts/react";
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
const DOMAIN_LABELS = 4;
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
    for (const value of Object.values(series)) {
      domainMin = math.min(domainMin, value);
      domainMax = math.max(domainMax, value);
      rangeMin = math.min(rangeMin, value);
      rangeMax = math.max(rangeMax, value);
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
                    LABEL_THICKNESS,
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
    </frame>
  );
}
