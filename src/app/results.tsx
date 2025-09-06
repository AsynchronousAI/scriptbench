import { Button, ScrollFrame } from "@rbxts/studiocomponents-react2";
import { COLORS, GetKeyColor } from "colors";
import { usePx } from "hooks/usePx";
import React, { useState } from "react";
import { FormatNumber } from "./graph/computation";

export interface Result {
  Name: string;
  NumberData: Array<[string, number]>;
  Order: number;
  IsMicroProfiler?: boolean;
}
export interface ResultsProps {
  Results: Result[];
}

function bytesToNumberLE(str: string): number {
  const bytes = str.split("").map((char) => string.byte(char)[0]);
  let result = 0;
  for (let i = 0; i < bytes.size(); i++) {
    result += bytes[i] * math.pow(256, i);
  }
  return result % 100;
}

export default function Results(props: ResultsProps) {
  const px = usePx();
  const size = px(25);
  const [openStates, setOpenStates] = useState(() =>
    props.Results.map(() => true),
  );

  const toggleOpen = (index: number) => {
    setOpenStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  return (
    <ScrollFrame
      Layout={{
        ClassName: "UIListLayout",
        SortOrder: Enum.SortOrder.LayoutOrder,
      }}
    >
      {props.Results.map((result, index) => (
        <frame
          key={`result-${index}`}
          Size={new UDim2(1, 0, 0, 0)}
          AutomaticSize="Y"
          BackgroundColor3={COLORS.LightBackground}
          LayoutOrder={result.Order * 100}
        >
          <uilistlayout FillDirection="Vertical" SortOrder="LayoutOrder" />

          {/* Toggle Button */}
          <textbutton
            Text=""
            Event={{
              MouseButton1Click: () => toggleOpen(index),
            }}
            Size={new UDim2(1, 0, 0, size)}
            BackgroundColor3={COLORS.LightBackground}
            BorderColor3={COLORS.Border}
            AutoButtonColor={false}
            TextScaled
          >
            <uipadding
              PaddingBottom={new UDim(0.1, 0)}
              PaddingRight={new UDim(0.1, 0)}
            />
            <uilistlayout
              FillDirection="Horizontal"
              Padding={new UDim(0.025, 0)}
              VerticalAlignment="Center"
            />
            <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
              <imagelabel
                Image="rbxassetid://139679203012669"
                ImageColor3={COLORS.Text}
                Size={new UDim2(0.6, 0, 0.6, 0)}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Rotation={openStates[index] ? 180 : 0}
              />
              <uiaspectratioconstraint />
            </frame>
            <textlabel
              Size={new UDim2(0.8, 0, 0.6, 0)}
              Position={new UDim2(0.5, 0, 0.5, 0)}
              AnchorPoint={new Vector2(0.5, 0.5)}
              Text={`<b>${result.Name}</b>`}
              RichText
              Font={Enum.Font.Code}
              TextColor3={GetKeyColor(index + 1)}
              TextScaled
              TextXAlignment="Left"
              BackgroundTransparency={1}
            />
          </textbutton>

          {/* Only render if open */}
          {openStates[index] &&
            result.NumberData.map(([key, val]) => (
              <frame
                key={`data-${index}-${key}`}
                LayoutOrder={result.Order * 100 + bytesToNumberLE(key)}
                Size={new UDim2(1, 0, 0, size)}
                BorderColor3={COLORS.Border}
                BackgroundTransparency={1}
              >
                <textlabel
                  Text={key}
                  Font={Enum.Font.Code}
                  TextColor3={COLORS.FocusText}
                  TextScaled
                  Size={new UDim2(0.5, 0, 1, 0)}
                  BackgroundColor3={COLORS.Background}
                  BorderColor3={COLORS.Border}
                >
                  <uipadding
                    PaddingTop={new UDim(0.3, 0)}
                    PaddingBottom={new UDim(0.2, 0)}
                  />
                </textlabel>
                <textlabel
                  Text={`${FormatNumber(val)} µs`}
                  Font={Enum.Font.Code}
                  TextColor3={COLORS.FocusText}
                  TextScaled
                  Size={new UDim2(0.5, 0, 1, 0)}
                  Position={new UDim2(0.5, 0, 0, 0)}
                  BackgroundColor3={COLORS.Background}
                  BorderColor3={COLORS.Border}
                >
                  <uipadding
                    PaddingTop={new UDim(0.3, 0)}
                    PaddingBottom={new UDim(0.2, 0)}
                  />
                </textlabel>
              </frame>
            ))}
        </frame>
      ))}
    </ScrollFrame>
  );
}
