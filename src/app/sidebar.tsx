import React, { useEffect, useState } from "@rbxts/react";
import { Background, Button, MainButton } from "@rbxts/studiocomponents-react2";
import { COLORS } from "colors";

export interface SidebarProps {
  Benchmarks: string[];

  OnSelection?: (benchmarkName: string) => void;
}

const GraphIcon = {
  Image: "rbxassetid://105442920358687",
  Size: Vector2.one.mul(16),
  UseThemeColor: true,
  Alignment: Enum.HorizontalAlignment.Left,
};
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
        return currentlySelected === name ? (
          <MainButton
            Text={name}
            Icon={GraphIcon}
            Size={new UDim2(0.2, 0, 0.075, 0)}
          />
        ) : (
          <Button
            Text={name}
            Icon={GraphIcon}
            Size={new UDim2(0.2, 0, 0.075, 0)}
            OnActivated={() => {
              setCurrentlySelected(name);
            }}
          />
        );
      })}
    </frame>
  );
}
