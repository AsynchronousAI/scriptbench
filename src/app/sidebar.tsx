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
      <uilistlayout FillDirection={"Vertical"} Padding={new UDim(0.01, 0)} />

      {props.Benchmarks.map((name, index) => {
        return (
          <textbutton
            BackgroundColor3={
              currentlySelected === name
                ? COLORS.Selected
                : COLORS.LightBackground
            }
            Text={name}
            TextColor3={COLORS.Text}
            Event={{
              MouseButton1Click: () => {
                setCurrentlySelected(name);
              },
            }}
          >
            <uicorner CornerRadius={new UDim(0, 8)} />
          </textbutton>
        );
      })}
    </frame>
  );
}
