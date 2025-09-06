import { usePx } from "hooks/usePx";
import React from "@rbxts/react";
import { COLORS } from "colors";
import { AsPosition, FormatNumber, InIncrements } from "./computation";
import {
  DOMAIN_LABELS,
  LABEL_TEXT_SIZE,
  LABEL_THICKNESS,
  RANGE_LABELS,
} from "configurations";
import { DomainRange } from "./types";

export function Labels(props: {
  domainRange: DomainRange;
  XPrefix?: string;
  YPrefix?: string;
  GridLines?: boolean;
}) {
  const px = usePx();
  const { DomainMin, DomainMax, Domain, RangeMin, RangeMax, Range } =
    props.domainRange;

  return (
    <>
      {/* Y axis border */}
      <frame
        Size={new UDim2(LABEL_THICKNESS + 0.2, 0, 1.5, 0)}
        Position={new UDim2(-LABEL_THICKNESS - 0.2, 0, -0.2, 0)}
        BackgroundColor3={COLORS.Background}
        BorderSizePixel={0}
        ZIndex={math.huge - 2}
      />

      {/* Domain tags + grid lines */}
      {InIncrements(
        DomainMin,
        DomainMax,
        DomainMax - DomainMin,
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
                  AsPosition(DomainMin, DomainMax, value) - LABEL_THICKNESS / 2,
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
              ZIndex={math.huge}
            />
            {props.GridLines && (
              <frame
                Size={new UDim2(0, 1, 1, 0)}
                Position={
                  new UDim2(AsPosition(DomainMin, DomainMax, value), 0, 0, 0)
                }
                BackgroundColor3={COLORS.Border}
                BorderSizePixel={0}
                ZIndex={5}
              />
            )}
          </>
        );
      })}

      {/* Range tags + grid lines */}
      {InIncrements(RangeMin, RangeMax, Range, RANGE_LABELS).map((value) => {
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
                  AsPosition(RangeMin, RangeMax, value, true) -
                    LABEL_THICKNESS / 2,
                  0,
                )
              }
              BackgroundTransparency={1}
              TextColor3={COLORS.Text}
              TextSize={px(LABEL_TEXT_SIZE)}
              TextXAlignment="Center"
              TextYAlignment="Center"
              ZIndex={math.huge}
            />
            {props.GridLines && (
              <frame
                Size={new UDim2(1, 0, 0, 1)}
                Position={
                  new UDim2(
                    0,
                    0,
                    AsPosition(RangeMin, RangeMax, value, true),
                    0,
                  )
                }
                BackgroundColor3={COLORS.Border}
                BorderSizePixel={0}
                ZIndex={5}
              />
            )}
          </>
        );
      })}
    </>
  );
}
