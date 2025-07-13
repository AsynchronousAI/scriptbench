import { Button, ScrollFrame } from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";
import { FormatNumber } from "graph";
import { usePx } from "hooks/usePx";
import React, { useState } from "react";

export interface Result {
  Name: string;
  Color: Color3;
  NumberData: Array<[string, number]>;
  Order: number;
}
export interface ResultsProps {
  Results: Result[];
}

export default function Results(props: ResultsProps) {
  return (
    <ScrollFrame>
      {props.Results.map((result, index) => {
        const [open, setOpen] = useState(true);
        const px = usePx();
        const size = px(35);

        return (
          <frame
            Size={new UDim2(1, 0, 0, 0)}
            AutomaticSize={"Y"}
            BackgroundColor3={COLORS.LightBackground}
            LayoutOrder={result.Order}
          >
            <uilistlayout
              FillDirection={"Vertical"}
              SortOrder={"LayoutOrder"}
            />

            {/* Button to open, not using StudioComponents. */}
            <textbutton
              Text=""
              Event={{
                MouseButton1Click: () => {
                  setOpen(!open);
                },
              }}
              Size={new UDim2(1, 0, 0, size)}
              BackgroundColor3={COLORS.LightBackground}
              BorderColor3={COLORS.Border}
              AutoButtonColor={false}
              TextScaled
            >
              {/* Layout */}
              <uipadding
                PaddingBottom={new UDim(0.1, 0)}
                PaddingRight={new UDim(0.1, 0)}
              />
              <uilistlayout
                FillDirection={"Horizontal"}
                Padding={new UDim(0.025, 0)}
                VerticalAlignment={"Center"}
              />

              {/* Icon */}
              <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
                <imagelabel
                  Image={"rbxassetid://139679203012669"}
                  ImageColor3={COLORS.Text}
                  Size={new UDim2(0.6, 0, 0.6, 0)}
                  Position={new UDim2(0.5, 0, 0.5, 0)}
                  AnchorPoint={new Vector2(0.5, 0.5)}
                  BackgroundTransparency={1}
                  Rotation={open ? 180 : 0}
                />
                <uiaspectratioconstraint />
              </frame>

              {/* Text */}
              <textlabel
                Size={new UDim2(0.8, 0, 0.6, 0)}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Text={`<b>${result.Name}</b>`}
                RichText
                Font={Enum.Font.Code}
                TextColor3={result.Color}
                TextScaled
                TextXAlignment={"Left"}
                BackgroundTransparency={1}
              />
            </textbutton>

            {/* Actual items */}
            {result.NumberData.map(([key, val], index) => {
              return (
                <frame
                  Visible={open}
                  LayoutOrder={index}
                  Size={new UDim2(1, 0, 0, size)}
                  Position={new UDim2(0.5, 0, 0.5, 0)}
                  AnchorPoint={new Vector2(0.5, 0.5)}
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
                    Text={FormatNumber(val)}
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
              );
            })}
          </frame>
        );
      })}
    </ScrollFrame>
  );
}
