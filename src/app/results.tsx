import { ScrollFrame } from "@rbxts/studiocomponents-react2";
import { COLORS, GetKeyColor } from "colors";
import React, { useState } from "@rbxts/react";
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

const STAT_ORDER: { [key: string]: number } = {
  Avg: 0,
  "50%": 1,
  "10%": 2,
  "90%": 3,
  Min: 4,
  Max: 5,
  StdDev: 6,
  Mode: 7,
  MAD: 8,
};

export default function Results(props: ResultsProps) {
  const [openStates, setOpenStates] = useState<{ [name: string]: boolean }>({});

  const isOpen = (name: string) => openStates[name] !== false;
  const toggleOpen = (name: string) =>
    setOpenStates((prev) => ({ ...prev, [name]: !isOpen(name) }));

  return (
    <ScrollFrame
      Layout={{
        ClassName: "UIListLayout",
        SortOrder: Enum.SortOrder.LayoutOrder,
      }}
    >
      {props.Results.map((result, index) => (
        <frame
          key={result.Name}
          Size={new UDim2(1, 0, 0, 0)}
          AutomaticSize="Y"
          BackgroundColor3={COLORS.LightBackground}
          LayoutOrder={result.Order * 100}
        >
          <uilistlayout FillDirection="Vertical" SortOrder="LayoutOrder" />

          {/* Toggle Button */}
          <textbutton
            Text=""
            Event={{ MouseButton1Click: () => toggleOpen(result.Name) }}
            Size={new UDim2(1, 0, 0, 28)}
            BackgroundColor3={COLORS.LightBackground}
            BorderColor3={COLORS.Border}
            AutoButtonColor={false}
            TextScaled
          >
            <uipadding
              PaddingTop={new UDim(0.2, 0)}
              PaddingBottom={new UDim(0.2, 0)}
              PaddingLeft={new UDim(0.02, 0)}
              PaddingRight={new UDim(0.02, 0)}
            />
            <uilistlayout
              FillDirection="Horizontal"
              Padding={new UDim(0.02, 0)}
              VerticalAlignment="Center"
            />
            <frame Size={new UDim2(0, 20, 1, 0)} BackgroundTransparency={1}>
              <imagelabel
                Image="rbxassetid://139679203012669"
                ImageColor3={COLORS.Text}
                Size={new UDim2(1, 0, 0, 0)}
                AutomaticSize="Y"
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Rotation={isOpen(result.Name) ? 180 : 0}
              />
              <uiaspectratioconstraint />
            </frame>
            <textlabel
              Size={new UDim2(1, -24, 1, 0)}
              Text={`<b>${result.Name}</b>`}
              RichText
              Font={Enum.Font.Code}
              TextColor3={GetKeyColor(index + 1)}
              TextScaled
              TextXAlignment="Left"
              BackgroundTransparency={1}
            />
          </textbutton>

          {/* Stat rows, shown when open */}
          {isOpen(result.Name) &&
            [...result.NumberData]
              .sort(([a], [b]) => (STAT_ORDER[a] ?? 99) < (STAT_ORDER[b] ?? 99))
              .map(([key, val]) => (
                <frame
                  key={key}
                  LayoutOrder={STAT_ORDER[key] ?? 99}
                  Size={new UDim2(1, 0, 0, 24)}
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
                      PaddingTop={new UDim(0.15, 0)}
                      PaddingBottom={new UDim(0.15, 0)}
                      PaddingLeft={new UDim(0.05, 0)}
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
                      PaddingTop={new UDim(0.15, 0)}
                      PaddingBottom={new UDim(0.15, 0)}
                      PaddingLeft={new UDim(0.05, 0)}
                    />
                  </textlabel>
                </frame>
              ))}
        </frame>
      ))}
    </ScrollFrame>
  );
}
