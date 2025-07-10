import React, { useEffect, useState } from "@rbxts/react";
import { COLORS } from "colors";

export interface SidebarProps {
  Benchmarks: string[];

  OnSelection?: (benchmarkName: string) => void;
}
export default function Sidebar(props: SidebarProps) {
  const [currentlySelected, setCurrentlySelected] = useState("");

  useEffect(() => {
    if (props.OnSelection) props.OnSelection(currentlySelected);
  }, [currentlySelected]);

  return (
    <frame Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={COLORS.Background}>
      <uilistlayout
        FillDirection={"Vertical"}
        HorizontalAlignment={"Center"}
        VerticalAlignment={"Center"}
        Padding={new UDim(0.05, 0)}
      />

      {props.Benchmarks.map((name, index) => {
        return (
          <textbutton
            AutoButtonColor={false}
            Size={new UDim2(0.65, 0, 0.15, 0)}
            BackgroundColor3={
              currentlySelected === name
                ? COLORS.Selected
                : COLORS.LightBackground
            }
            TextColor3={
              currentlySelected === name ? new Color3(0, 0, 0) : COLORS.Text
            }
            BackgroundTransparency={0}
            Text={name}
            Font="BuilderSansBold"
            TextScaled
            Event={{
              MouseButton1Click: () => {
                setCurrentlySelected(name);
              },
            }}
          >
            <uipadding
              PaddingTop={new UDim(0.25, 0)}
              PaddingBottom={new UDim(0.25, 0)}
            />
            <uicorner CornerRadius={new UDim(0, 8)} />
          </textbutton>
        );
      })}
    </frame>
  );
}
